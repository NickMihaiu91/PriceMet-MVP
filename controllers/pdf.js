var phantomjs = require('phantom'),
    fs = require('fs'),
    session,
    renderingPdf = false,
    vouchersGeneratedPaths = [];

exports.initializePhantomSession = function (cb) {
    if (session) {
        return cb(null, session);
    } else {
        phantomjs.create({
            dnodeOpts: {
                weak: false
            }
        }, function (_session) {
            session = _session;
            return cb(null, session);
        });
    }
};

exports.renderPdf = function (voucherNumber, cleanUpIndex, cb) {
    var page;
    
    if (!renderingPdf) {
        renderingPdf = true;
        
        try {
            session.createPage(function (_page) {
                page = _page;
                page.set('paperSize', {
                    format: 'A4'
                }, function () {
                    
                    page.set('onCallback', function (success) {
                        var file = 'generated_vouchers/voucher_' + voucherNumber + '.pdf';
                        page.render(file, { format: 'pdf', quality: '100' }, function () {
                            console.log("rendered ", voucherNumber);
                            page.close();
                            page = null;
                            renderingPdf = false;

                            if (typeof vouchersGeneratedPaths[cleanUpIndex] == 'object')
                                vouchersGeneratedPaths[cleanUpIndex].push(file);
                            else
                                vouchersGeneratedPaths[cleanUpIndex] = [file];
                            
                            return cb(null, file);
                        });
                    });
                    
                    page.open("http://localhost/voucher-generate?vn=" + voucherNumber, function (status) {
                        console.log("opened page ", status);
                    });

                });
            });
        } catch (e) {
            try {
                if (page != null) {
                    page.close(); // try close the page in case it opened but never rendered a pdf due to other issues
                }
            } catch (e) {
                // ignore as page may not have been initialised
            }
            return cb('Exception rendering pdf:' + e.toString());
        }
    }
    else {
        setTimeout(function () {
            exports.renderPdf(voucherNumber, cleanUpIndex, cb);
        }, 2000);
    }
};

exports.cleanUp = function (cleanUpIndex, cb) { 
    if (!vouchersGeneratedPaths[cleanUpIndex])
        return;

    var counter = 0;

    for (var i = 0; i < vouchersGeneratedPaths[cleanUpIndex].length; i++) {
        fs.unlink(vouchersGeneratedPaths[cleanUpIndex][i], function (err) {
            if (err)
                console.log('error deleting file ', vouchersGeneratedPaths[cleanUpIndex][counter]);

            //console.log('successfully deleted ', vouchersGeneratedPaths[cleanUpIndex][counter]);
            counter++;

            if (counter == vouchersGeneratedPaths[cleanUpIndex].length) {
                vouchersGeneratedPaths[cleanUpIndex] = null;
                cb();
            }
        });
    }
};

process.on('exit', function (code, signal) {
    if (session)
        session.exit();
});