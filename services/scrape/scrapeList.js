const getContactList = require('@scrape/puppeteer/getContactList');
const getPage = require('@scrape/puppeteer/getPage');
const logger = require('@services/logger');

module.exports = async function scrapeList(cookie, user){
    return new Promise(async (resolve, reject) => {

        let valid = false, retries = 0, fatal = false, result;
        while(!valid && !fatal) {
            valid = true;
            const page = await getPage();
            result = await getContactList(page, cookie, user).catch(async (err) => {

                try {
                    page.browser().close();
                } catch (err) {
                    logger.warn('Unable to close browser - ' + JSON.stringify(err), {user: user, path: 'scrapeList'});
                }
                if(err.name === 'banned'){
                    fatal = true;
                    logger.error('Too many bans', {user: user, path:'scrapeList'});
                    err.name = 'too_many_bans';
                    return reject(err);
                }else if (err.name === 'revoked') {
                    fatal = true;
                    logger.error('Cookie revoked', {user: user, path: 'scrapeList'});
                    return reject(err);
                }else if(err.name === 'TimeoutError'){
                    valid = false;
                    if(retries >= 3){
                        fatal = true;
                        logger.error('Too many retries - ' + JSON.stringify(err), {user: user, path:'scrapeList'});
                        return reject(err);
                    }
                    logger.warn("Timeout, let's retry - " + JSON.stringify(err), {user: user, path:'scrapeList'});
                    retries++;
                }else {
                    fatal = true;
                    logger.error('Unknown error - ' + JSON.stringify(err), {user: user, path:'scrapeList'});
                    return reject(err);
                }
            });

            try {
                page.browser().close();
            } catch (err) {
                logger.warn('Unable to close browser - ' + JSON.stringify(err), {user: user, path: 'scrapeList'});
            }
        }
        resolve(result);
    })
}
