
const logs = require('express').Router();
const axios = require("axios");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { authJwt } = require("../middleware");

logs.post("/logs", 
    [
      authJwt.verifyToken
    ],
    async (req, res, next) => {
    let error = null
    let doc = undefined
    const albums = req.body.albums
    try {
        doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
        });
        doc.loadInfo();
    } catch (errors) {
        error = {
            message: errors.message,
            name: errors.name
        }
    }
    if (albums &&  error === null) {
        let axiosAlbum = []
        albums.forEach(id => {
            let instance = axios.get(`https://jsonplaceholder.typicode.com/albums/${id}`)
            axiosAlbum.push(instance)
        });
        const results = await axios.all(axiosAlbum).then(axios.spread((...responses) => {
            const responseObj = responses.map(item => item.data)
            return {
                status: true,
                data: responseObj
            }
        })).catch(errors => {
            return {
                status: false,
                data: errors
            }
        })
        if (results && results.status) {
            let axiosUsers = []
            let info = []
            results.data.forEach((item) => {
                info.push({
                    title: item.title
                })
                let userinstance = axios.get(` https://jsonplaceholder.typicode.com/users/${item.userId}`)
                axiosUsers.push(userinstance)
            })
            const userResults = await axios.all(axiosUsers).then(axios.spread((...responses) => {
                const responseObj = responses.map(item => item.data)
                return {
                    status: true,
                    data: responseObj
                }
            })).catch(errors => {
                return {
                    status: false,
                    data: errors
                }
            })
            if (userResults && userResults.status) {
                const finalData = info.map((item, index) => {
                    return { ...item, username: userResults.data[index].username }
                })
                const sheet = doc.sheetsByIndex[0]

                const headerRows = await sheet.setHeaderRow(['title', 'username']);
                const rows = await sheet.getRows();
                await sheet.addRows(finalData)
                const rowsupdated = await sheet.getRows();
                return res.json({
                    status: true,
                    data: finalData
                });
            } else {
                return res.json({
                    status: true,
                    data: results
                });
            }
        } else {
            return res.json({
                status: true,
                data: "userResults"
            });
        }
    } else if (!albums) {
        error = 'Album id is required'
    }
    res.json({
        status: false,
        data: error
    });
});

module.exports = logs