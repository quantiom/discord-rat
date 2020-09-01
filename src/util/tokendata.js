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

module.exports = TokenData;
