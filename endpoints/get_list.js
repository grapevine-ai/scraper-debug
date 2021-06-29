const logger = require('@services/logger');
const scrapeList = require('@scrape/scrapeList');

module.exports = (app) => {
    app.post('/get_list', async(req, res) => {
        if (!req.body.cookie) {
            logger.info('Scrape without cookie', {user: 'none', path: '/get_list'});
        }
        const result = await scrapeList(req.body.cookie, 'none').catch(async reject => {
            if (reject.name === 'too_many_bans') {
                logger.error('Too many bans', {user: 'none', path: 'get_list'});
            } else if (reject.name === 'revoked') {
                logger.error('Cookie revoked', {user: 'none', path: 'get_list'});
            } else {
                logger.error('Unknown error - ' + JSON.stringify(reject), {user: 'none', path: 'get_list'});
            }
        });

        logger.info('Contacts found - ' + result, {user: 'none', path: 'get_list'});
    })
}
