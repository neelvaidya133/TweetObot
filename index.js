const express = require("express");
const app = express();
const axios = require("axios");
const moment = require("moment");

const BASIC_URL = "https://api.twitter.com/2/";
const USER_BOTOMETER_PATH = "https://botometer-pro.p.rapidapi.com/4/check_account";
const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAACCiZgEAAAAAHiLrAtS4SoUfnKoCSJ045B0JwqA%3DbftuB6RiaA4i2yFj3GT5KJ3bqWcYtBXjmTXyJo8woi50SAwuhB";

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const getUserData = async (userName) => {
    const USER_PATH = `users/by/username/${userName}?user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,non_public_metrics,organic_metrics,possibly_sensitive,promoted_metrics,public_metrics,referenced_tweets,source,text`;
    const options = {
        method: 'GET',
        url: BASIC_URL + USER_PATH,
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    const userData = await axios.request(options).then(function (response) {
        const userData = response.data.data;
        return userData;
    }).catch(function (error) {
        return [];
    });

    return userData;
}

const getUserTweeterData = async (userId) => {
    const USER_TWEET_PATH = `users/${userId}/tweets?expansions=attachments.poll_ids,attachments.media_keys,author_id,geo.place_id,in_reply_to_user_id,referenced_tweets.id,entities.mentions.username,referenced_tweets.id.author_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified&media.fields=duration_ms,height,media_key,non_public_metrics,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,width&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type`;

    const options = {
        method: 'GET',
        url: BASIC_URL + USER_TWEET_PATH,
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    const tweetData = await axios.request(options).then(function (tweetRes) {
        return tweetRes.data;
    }).catch(function (error) {
        return null;
    });

    return tweetData;
}

const getUserMentionsData = async (userId) => {
    const USER_MENTION_PATH = `users/${userId}/mentions?tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified&media.fields=duration_ms,height,media_key,non_public_metrics,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,width&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type`;
    const options = {
        method: 'GET',
        url: BASIC_URL + USER_MENTION_PATH,
        headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${BEARER_TOKEN}`
        },
    };

    const mentionsData = await axios.request(options).then(function (mentionsRes) {
        return mentionsRes.data;
    }).catch(function (error) {
        return null;
    });

    return mentionsData;
}

app.get("/getUserBotometer",async (req, res) => {
    const {userName} = req.query;

    const userData = await getUserData(userName);
    const tweetsData = await getUserTweeterData(userData?.id);
    const mentionsData = await getUserMentionsData(userData?.id);

    if (tweetsData && tweetsData?.data?.length && mentionsData && mentionsData?.data?.length){
        const twitterData = tweetsData.data;
        const mensionData = mentionsData.data;

        const customMentionsPayload = {
            contributors: null,
            coordinates: null,
            created_at: mensionData[0]?.created_at && moment(mensionData[0]?.created_at).format('ddd MMM DD HH:mm:ss ZZ YYYY')|| null,
            entities: {
                hashtags: [],
                symbols: [],
                // urls: userData?.entities?.url?.urls || [],
                urls: [],
                user_mentions: mensionData.length && mensionData[0]?.entities && mensionData[0]?.entities?.mentions && mensionData[0]?.entities?.mentions.length && mensionData[0]?.entities?.mentions.map(data => {
                    return {
                        id: +data.id,
                        id_str: data.id,
                        indices: [data.start, data.end],
                        name: data.username,
                        screen_name: data.username
                    }
                }) || []
            },
            favorite_count: 0,
            favorited: false,
            geo: null,
            id: +mensionData[0]?.id || null,
            id_str: mensionData[0]?.id || null,
            in_reply_to_screen_name: null,
            in_reply_to_status_id: null,
            in_reply_to_status_id_str: null,
            // in_reply_to_user_id: +mensionData[0]?.in_reply_to_user_id || null,
            in_reply_to_user_id: null,
            // in_reply_to_user_id_str: mensionData[0]?.in_reply_to_user_id || null,
            in_reply_to_user_id_str: null,
            is_quote_status: false,
            lang: mensionData[0]?.lang || null,
            metadata: {iso_language_code: 'en', result_type: 'recent'},
            place: null,
            retweet_count: mensionData[0]?.public_metrics?.retweet_count || 0,
            retweeted: false,
            retweeted_status: {
                contributors: null,
                coordinates: null,
                created_at: 'Mon Jul 20 16:03:30 +0000 2020',
                entities: {hashtags: [], symbols: [], urls: [], user_mentions: []},
                favorite_count: 0,
                favorited: false,
                geo: null,
                id: +userData?.id || null,
                id_str: userData?.id || null,
                in_reply_to_screen_name: null,
                in_reply_to_status_id: null,
                in_reply_to_status_id_str: null,
                in_reply_to_user_id: null,
                in_reply_to_user_id_str: null,
                is_quote_status: false,
                lang: 'en',
                metadata: {iso_language_code: 'en', result_type: 'recent'},
                place: null,
                possibly_sensitive: false,
                retweet_count: 14,
                retweeted: false,
                source: mensionData[0]?.source || null,
                text: mensionData[0]?.text || null,
                truncated: true,
                user: {
                    contributors_enabled: false,
                    created_at: userData?.created_at && moment(userData?.created_at).format('ddd MMM DD HH:mm:ss ZZ YYYY')|| null,
                    default_profile: true,
                    default_profile_image: false,
                    description: 'description',
                    entities: {},
                    favourites_count: 0,
                    follow_request_sent: false,
                    followers_count: userData?.public_metrics?.followers_count || 0,
                    following: false,
                    friends_count: 0,
                    geo_enabled: false,
                    has_extended_profile: true,
                    id: +userData?.id || null,
                    id_str: userData?.id || null,
                    is_translation_enabled: false,
                    is_translator: false,
                    lang: null,
                    listed_count: userData?.public_metrics?.listed_count || 0,
                    location: 'location',
                    name: userData?.name || null,
                    notifications: false,
                    profile_background_color: 'F5F8FA',
                    profile_background_image_url: null,
                    profile_background_image_url_https: null,
                    profile_background_tile: false,
                    profile_banner_url: null,
                    profile_image_url: null,
                    profile_image_url_https: null,
                    profile_link_color: '1DA1F2',
                    profile_sidebar_border_color: 'C0DEED',
                    profile_sidebar_fill_color: 'DDEEF6',
                    profile_text_color: '333333',
                    profile_use_background_image: true,
                    protected: false,
                    screen_name: userData?.username || null,
                    statuses_count: 0,
                    time_zone: null,
                    translator_type: 'none',
                    url: null,
                    utc_offset: null,
                    verified: false
                }
            },
            source: mensionData[0]?.source || null,
            text: mensionData[0]?.text || null,
            truncated: false,
            user: {
                contributors_enabled: false,
                created_at: userData?.created_at && moment(userData?.created_at).format('ddd MMM DD HH:mm:ss ZZ YYYY')|| null,
                default_profile: true,
                default_profile_image: false,
                description: '',
                // entities: {description: {urls: userData?.entities?.url?.urls || []}},
                entities: {description: {urls: []}},
                favourites_count: 0,
                follow_request_sent: false,
                followers_count: userData?.public_metrics?.followers_count || 0,
                following: false,
                friends_count: 0,
                geo_enabled: true,
                has_extended_profile: false,
                id: +userData?.id || null,
                id_str: userData?.id || null,
                is_translation_enabled: false,
                is_translator: false,
                lang: null,
                listed_count: userData?.public_metrics?.listed_count || 0,
                location: 'location',
                name: userData?.name || null,
                notifications: false,
                profile_background_color: 'C0DEED',
                profile_background_image_url: null,
                profile_background_image_url_https: null,
                profile_background_tile: false,
                profile_image_url: null,
                profile_image_url_https: null,
                profile_link_color: '1DA1F2',
                profile_sidebar_border_color: 'C0DEED',
                profile_sidebar_fill_color: 'DDEEF6',
                profile_text_color: '333333',
                profile_use_background_image: true,
                protected: false,
                screen_name: userData?.username || null,
                statuses_count: 0,
                time_zone: null,
                translator_type: 'none',
                url: null,
                utc_offset: null,
                verified: false
            }
        }

        const customTimelinePayload = {
            contributors: null,
            coordinates: null,
            created_at: twitterData[0]?.created_at && moment(twitterData[0]?.created_at).format('ddd MMM DD HH:mm:ss ZZ YYYY')|| null,
            entities: {
                // hashtags: twitterData[0]?.entities?.hashtags || [],
                hashtags: [],
                symbols: [],
                urls: [],
                user_mentions: twitterData.length && twitterData[0]?.entities && twitterData[0]?.entities?.mentions && twitterData[0]?.entities?.mentions.length && twitterData[0]?.entities?.mentions.map(data => {
                    return {
                        id: +data?.id,
                        id_str: data?.id,
                        indices: [data?.start, data?.end],
                        name: data?.username,
                        screen_name: data?.username
                    }
                }) || []
            },
            favorite_count: 0,
            favorited: false,
            geo: null,
            id: +twitterData[0]?.id || null,
            id_str: twitterData[0]?.id || null,
            in_reply_to_screen_name: null,
            in_reply_to_status_id: null,
            in_reply_to_status_id_str: null,
            in_reply_to_user_id: +twitterData[0]?.in_reply_to_user_id || null,
            in_reply_to_user_id_str: twitterData[0]?.in_reply_to_user_id || null,
            is_quote_status: false,
            lang: twitterData[0]?.lang || null,
            place: null,
            retweet_count: twitterData[0]?.public_metrics?.retweet_count || 0,
            retweeted: false,
            source: twitterData[0]?.source || null,
            text: twitterData[0]?.text || null,
            truncated: false,
            user: {
                contributors_enabled: false,
                created_at: userData?.created_at && moment(userData?.created_at).format('ddd MMM DD HH:mm:ss ZZ YYYY')|| null,
                default_profile: true,
                default_profile_image: false,
                description: 'description',
                // entities: {description: {urls: userData?.entities?.url?.urls || []}, url: {urls: userData?.entities?.url?.urls || []}},
                entities: {description: {urls: []}, url: {urls: []}},
                favourites_count: 0,
                follow_request_sent: false,
                followers_count: userData?.public_metrics?.followers_count || 0,
                following: false,
                friends_count: 0,
                geo_enabled: false,
                has_extended_profile: true,
                id: +userData?.id || null,
                id_str: userData?.id || null,
                is_translation_enabled: false,
                is_translator: false,
                lang: null,
                listed_count: userData?.public_metrics?.listed_count || 0,
                location: 'location',
                name: userData?.name || null,
                notifications: false,
                profile_background_color: 'F5F8FA',
                profile_background_image_url: null,
                profile_background_image_url_https: null,
                profile_background_tile: false,
                profile_banner_url: null,
                profile_image_url: null,
                profile_image_url_https: null,
                profile_link_color: '1DA1F2',
                profile_sidebar_border_color: 'C0DEED',
                profile_sidebar_fill_color: 'DDEEF6',
                profile_text_color: '333333',
                profile_use_background_image: true,
                protected: false,
                screen_name: userData?.username || null,
                statuses_count: 0,
                time_zone: null,
                translator_type: 'none',
                url: null,
                utc_offset: null,
                verified: false
            }
        }

        const botometerPayload = {
            mentions: [customMentionsPayload],
            timeline: [customTimelinePayload],
            user: {id_str: userData?.id, screen_name: userData?.username}
        };

        const options = {
            method: 'POST',
            url: `${USER_BOTOMETER_PATH}`,
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-host': 'botometer-pro.p.rapidapi.com',
                'x-rapidapi-key': '49d6809814mshb61d03b114bdae5p189778jsn6223a6176ff8'
            },
            data: {
                ...botometerPayload
            }
        };

        axios.request(options).then(function (response) {
            const data = response.data;

            const responseData = {
                name: userData?.name || "",
                followers_count: userData?.public_metrics?.followers_count || "",
                following_count: userData?.public_metrics?.following_count || "",
                tweet_count: userData?.public_metrics?.tweet_count || "",
                description: userData?.description || "",
                tweetData: twitterData || [],
                userScoreData: data,
            }
            res.send({data: {...responseData},message: ""});
        }).catch(function (error) {
            res.send({data: null,message: "Server Unavailable"});
        });
    }else{
        res.send({data: null,message: "Server Unavailable"});
    }
});

app.listen(5000,() => {
    console.log("Listening on 3000");
})