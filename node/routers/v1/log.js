const logs = require('express').Router();
const axios = require("axios");
const urlExist = require("url-exist");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { authJwt } = require("../middleware");

// Third Party URl
const API_URL = 'https://jsonplaceholder.typicode.com'

logs.post("/logs",
    [
        authJwt.verifyToken
    ],
    async (req, res, next) => {
        let error = null;
        let albums = req.body.albums
        if (!Array.isArray(albums)) {
            res.json({
                status: false,
                data: 'Please provide albums as array.'
            });
        }
        if (albums && error === null) {
            let axiosAlbum = []
            albums = [...new Set(albums)];
            for (let index = 0; index < albums.length; index++) {
                let url = `${API_URL}/albums/${albums[index]}`
                // check for url exist
                const checkUrl = await urlExist(url);
                if (checkUrl) {
                    let instance = axios.get(url)
                    axiosAlbum.push(instance)
                }
            }
            if (axiosAlbum.length > 0) {
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
                        let userinstance = axios.get(`${API_URL}/users/${item.userId}`)
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
                        try {
                            // pass the google sheet it to GoogleSpreadsheet
                            // Initialization is required for every request to update the auth/access token for
                            // request to google

                            const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
                            await doc.useServiceAccountAuth({
                                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                                private_key: process.env.GOOGLE_PRIVATE_KEY,
                            });
                            await doc.loadInfo();
                            const sheet = doc.sheetsByIndex[0]
                            await sheet.addRows(finalData)
                            return res.json({
                                status: true,
                                data: finalData
                            });
                        } catch (errors) {
                            // if any error in google sheet api
                            error = {
                                message: errors.message,
                                name: errors.name,
                                stack: errors.stack
                            }
                            return res.json({
                                status: false,
                                data: error
                            });
                        }
                    } else {
                        return res.json({
                            status: true,
                            data: userResults
                        });
                    }
                } else {
                    return res.json({
                        status: true,
                        data: results
                    });
                }
            } else {
                error = 'One of the album id is not valid.'
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