const logger = require('@services/logger');
const scrapeList = require('@scrape/scrapeList');

module.exports = (app) => {
    app.post('/get_list', async(req, res) => {
        if (!req.body.cookie) {
            logger.warn('No li cookie provided', {user: 'none', path: '/get_list'});
            return res.status(422).send({
                error: 'invalid li cookie',
                name: 'invalid_li_cookie',
                status: 422,
                message: 'Invalid or no li cookie provided.'
            });
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
