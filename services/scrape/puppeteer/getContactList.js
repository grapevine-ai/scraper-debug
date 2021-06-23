const logger = require('@services/logger');


const VIEWPORT_HEIGHT = 800;

const getContactList = async(page, cookie, user)=>{

    return new Promise(async (resolve, reject) => {
        try{
            logger.info('Configure page', {user: 'none', path:'getContactList'});
            await page.setViewport({ width: 1200, height: VIEWPORT_HEIGHT});

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'image') request.abort();
                else request.continue();
            });

            logger.info('Set up cookie', {user: 'none', path:'getContactList'});
            await page.setCookie({name: 'li_at', value: cookie, domain: '.www.linkedin.com'});

            logger.info('Authenticate proxy', {user: 'none', path:'getContactList'});
            if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(process.env.PROXY_IP)){
                await page.authenticate({
                    username: 'lum-customer-' + process.env.PROXY_CUSTOMER + '-zone-' + process.env.PROXY_ZONE + '-ip-' + process.env.PROXY_IP,
                    password: process.env.PROXY_PASS
                });
            }

            logger.info('Open page', {user: 'none', path:'getContactList'});
            await page.goto('https://www.linkedin.com/mynetwork/invite-connect/connections/',{timeout:60000});

            logger.info('Wait for selector', {user: 'none', path:'getContactList'});
            await page.waitForSelector('.mn-connection-card', {
                visible: true,
            });

            // Check if cookie was revoked
            const cookieRevoked = await page.$('.join-form')?true:await page.$('.sign-in-form-container')?true:false;
            if(cookieRevoked){
                reject({name:'revoked', reason: 'Cookie revoked'});
                return;
            }

            const ipBanned = await page.$('body.errorpg')?true:false;
            if(ipBanned){
                reject({name:'banned', reason: 'IP Banned'});
                return;
            }

            let totalHeight = VIEWPORT_HEIGHT, height = 1, max = false, connections = [], promises=[], connectionsCounter = 0;
            // Scroll to the bottom, then scroll up a bit and down again to trigger the load spinner
            while(height !== totalHeight){
                logger.info('First scroll down', {user: 'none', path:'getContactList'});
                let scrolled = await autoScroll(page, totalHeight, connectionsCounter);
                totalHeight = ((scrolled || {}).height) || 0;
                height = totalHeight;
                connectionsCounter += ((scrolled || {}).items || []).length;

                logger.info('Scroll up', {user: 'none', path:'getContactList'});
                scrolled = await scrollUp(page, totalHeight);
                totalHeight = ((scrolled || {}).height) || 0;
                logger.info('Second scroll down', {user: 'none', path:'getContactList'});
                scrolled = await autoScroll(page, totalHeight, connectionsCounter);
                connectionsCounter += ((scrolled || {}).items || []).length;
                totalHeight = ((scrolled || {}).height) || 0;
            }

            const html = await page.evaluate(() => document.documentElement.innerHTML);

            Promise.all(promises).then(values => {
                resolve(connectionsCounter + 10);
            });
        }catch(err){
            reject(err);
        }
    })
}

const autoScroll = async (page, totalHeight, connectionsCounter) =>{
    return await page.evaluate(async (totalHeight, VIEWPORT_HEIGHT, connectionsCounter) => {

        // Remove messenger to avoid confusion with loader
        Array.prototype.slice.call(document.getElementsByTagName('aside')).forEach((item)=> {
            item.remove();
        });

        let items = [];
        const DISTANCE=20, TIMEOUT=1, CONNECTIONSTOKEEP=10;
        return await new Promise(async(resolve, reject) => {
            let scroll;
            const timer = () => scroll = setInterval(() => {

                // Scroll down
                window.scrollBy(0, DISTANCE);
                let scrollHeight = document.body.scrollHeight;
                // Set the total height to the total scrolled distance or the maximum scroll height (whichever is lower)
                totalHeight = Math.min(totalHeight + DISTANCE, scrollHeight);

                if(totalHeight >= scrollHeight){
                    // Pause scrolling until you check if there is more to load
                    clearInterval(scroll);


                    // Wait a bit to see if the load spinner shows up
                    setTimeout(async ()=>{

                        const connections = document.querySelector('.mn-connections').querySelector('ul').children;
                        // Copy and remove what was loaded to speed up and free up the memory (known as "virtual pagination")
                        const length = connections.length;
                        for(let int = 1; int <= length - CONNECTIONSTOKEEP; int++){
                            items.push(connections[0]);
                            document.querySelector('.mn-connections').querySelector('ul').removeChild(connections[0]);
                            if(int === length - CONNECTIONSTOKEEP){
                                window.scrollBy(0, -10000);
                                totalHeight = VIEWPORT_HEIGHT;
                            }
                        }
                        // Trigger Garbage collector
                        gc();

                        // Check if the spinning loader is present and if you are at the bottom of the page
                        //let loader = document.querySelectorAll(".artdeco-loader");
                        let loader = Array.from(document.querySelectorAll('.artdeco-loader')).filter(s =>
                            window.getComputedStyle(s).getPropertyValue('display') != 'none'
                        );
                        let scrollHeight = document.body.scrollHeight;

                        // Else, check if it reached the end without the loader
                        if (loader.length <= 0 && totalHeight >= scrollHeight) {
                            resolve({height: totalHeight, max: false, items:items});
                        }else{
                            // Remove messenger to avoid confusion with loader
                            Array.prototype.slice.call(document.getElementsByTagName('aside')).forEach((item)=> {
                                item.remove();
                            });
                            timer();
                        }

                    }, 3000);
                }
            }, TIMEOUT);

            // Trigger the timer
            timer();
        });

    }, totalHeight, VIEWPORT_HEIGHT, connectionsCounter);
}


const scrollUp = async (page, totalHeight) =>{
    return await page.evaluate(async (totalHeight, VIEWPORT_HEIGHT) => {

        const DISTANCE_UP = -100;
        const ITERATION_NUM = 5;
        const TIMEOUT = 50;

        // Scrolls up a bit before scrolling down again to trigger the load spinner
        return await new Promise((resolve, reject) => {
            let iterations = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, DISTANCE_UP);
                totalHeight = Math.min(totalHeight + DISTANCE_UP, VIEWPORT_HEIGHT);

                iterations++;

                if(iterations === ITERATION_NUM){
                    clearInterval(timer);
                    resolve({height: totalHeight});
                }

            }, TIMEOUT);
        });
    }, totalHeight, VIEWPORT_HEIGHT);
}


module.exports = getContactList;
