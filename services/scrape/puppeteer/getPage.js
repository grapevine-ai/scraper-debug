const puppeteer = require('puppeteer');

const logger = require('@services/logger');

module.exports = async function getPage(){
    return new Promise(async (resolve, reject) => {
        let browser;
        if(process.env.NODE_ENV === 'dev'){
            let args = ['--js-flags=--expose-gc', '--single-process', '--no-zygote', '--no-sandbox', '--ignore-certificate-errors'];
            if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(process.env.PROXY_IP)){
                args.push('--proxy-server=' + process.env.PROXY_ADDRESS);
                logger.info('Proxy - ' + process.env.PROXY_IP, {user: 'admin', path:'getPage'});
            }else{
                logger.info('No proxy', {user: 'admin', path:'getPage'});
            }

            browser = await puppeteer.launch({
                headless: false,
                ignoreHTTPSErrors:true,
                args: args
            }).catch(err=>{
                logger.error('Unable to launch browser - ' + JSON.stringify(err), {user: 'admin', path:'getPage'});
                reject({reason: err});
            });
        }else{
            let args = ['--js-flags=--expose-gc', '--single-process', '--no-zygote', '--no-sandbox', '--headless', '--disable-gpu', '--ignore-certificate-errors'];
            if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(process.env.PROXY_IP)){
                args.push('--proxy-server=' + process.env.PROXY_ADDRESS);
                logger.info('Proxy - ' + process.env.PROXY_IP, {user: 'admin', path:'getPage'});
            }else{
                logger.info('No proxy', {user: 'admin', path:'getPage'});
            }
            browser =await puppeteer.launch({
                headless: true,
                ignoreHTTPSErrors:true,
                executablePath: '/usr/bin/chromium-browser',
                args: args
            }).catch(err=>{
                logger.error('Unable to launch browser - ' + JSON.stringify(err), {user: 'admin', path:'getPage'});
                reject({reason: err});
            });
        }
        if(browser){
            logger.info('Create page', {user: 'admin', path:'getPage'});
            const page = await browser.newPage().catch(err=>{
                logger.error('Unable to create page - ' + JSON.stringify(err), {user: 'admin', path:'getPage'});
                reject({reason: err});
            })
            if(page){
                resolve(page);
            }
        }
    })
}
