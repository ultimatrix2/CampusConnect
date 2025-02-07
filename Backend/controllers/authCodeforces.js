
const {JSDOM} = require("jsdom");
const axios = require("axios");


//function to get DOM node represented by the given xpath
function getElementByXpath(document, path) {
    return document.evaluate(path, document, null, 9, null).singleNodeValue;
}


//function to return user info else than heatmap
exports.getUserDetails = async (req, res, next) => {
    try{
    
    //codeforces has an official api to retrieve user data, but the data returned is very limited
    //for example we don't have endpoint to retrieve the streak or total questions submission
   
    const username = req.body.username;
    const profileLink = `https://codeforces.com/profile/${username}`;

    const requestOptions = {
        method: "GET",
        redirect: "follow"
      };
      
    const r = await fetch(profileLink, requestOptions);
    const response = await r.text();

    const dom = new JSDOM(response);
    const document = dom.window.document;

    const handler = getElementByXpath(document, "//*[@id=\"pageContent\"]/div[2]/div/div[2]/div/h1/a").textContent;

    let rank = getElementByXpath(document, "//*[@id=\"pageContent\"]/div[2]/div/div[2]/ul/li[1]").textContent;
    const regex = /Contest rating:\s+(\d+)/s;
    const match = rank.match(regex);
    rank = match ? match[1] : 0;

    const streak = getElementByXpath(document, "//*[@id=\"pageContent\"]/div[4]/div/div[3]/div[2]/div[1]/div[1]").textContent.replace(/\D/g, "") || 0;
    const submissionCount = [{
        difficulty: "All",
        count: getElementByXpath(document, "//*[@id=\"pageContent\"]/div[4]/div/div[3]/div[1]/div[1]/div[1]").textContent.replace(/\D/g, "") || 0
    }];


    const title = getElementByXpath(document, "//*[@id=\"pageContent\"]/div[2]/div/div[2]/div/div[1]/span").textContent;

    res.status(200).json({
        status: 'success', data: {
            platformName: "CODEFORCES", profileLink, handler, rank, streak, submissionCount, title
        }
    })
} catch(e){
    console.log(e);
}
};

