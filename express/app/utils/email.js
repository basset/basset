const path = require('path');
const aws = require('aws-sdk');
const Email = require('email-templates');

const settings = require('../settings');
const { generateToken } = require('./auth/token');
const { encode } = require('./safe-base64');

const getTransport = () => {
  if (settings.env && settings.env.toLowerCase() === 'test') {
    return {
      jsonTransport: true,
    };
  }
  if (settings.mail.ses) {
    const config = {
      apiVersion: '2010-12-01',
    };
    if (
      settings.mail.sesConfig.accessKeyId &&
      settings.mail.sesConfig.secretAccessKey
    ) {
      config.accessKeyId = settings.mail.sesConfig.accessKeyId;
      config.secretAccessKey = settings.mail.sesConfig.secretAccessKey;
    }
    return {
      SES: new aws.SES(config),
    };
  } else {
    return {
      host: settings.mail.host,
      port: settings.mail.port,
    };
  }
};
const email = new Email({
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: path.join(__dirname, '../emails'),
    },
  },
  message: {
    from: settings.mail.email,
  },
  send: true,
  transport: getTransport(),
  views: {
    root: path.join(__dirname, '../emails'),
    options: {
      extension: 'ejs',
    },
  },
  preview: false,
});

const locals = {
  website: 'http://basset.io',
  unsubscribe: 'http://basset.io',
};

const sendInviteEmail = async invite => {
  try {
    await email.send({
      template: 'invite',
      message: {
        to: invite.email,
      },
      locals: {
        link: `${settings.site.url}/invite/${invite.id}/${invite.token}`,
        ...locals,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const sendActivationEmail = async user => {
  const token = generateToken(user);
  const uidb64 = encode(user.id.toString());

  try {
    await email.send({
      template: 'activate',
      message: {
        to: user.email,
      },
      locals: {
        user: user,
        link: `${settings.site.url}/activate/${uidb64}/${token}`,
        ...locals,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const sendPasswordResetEmail = async user => {
  const token = generateToken(user);
  const uidb64 = encode(user.id.toString());
  try {
    await email.send({
      template: 'reset',
      message: {
        to: user.email,
      },
      locals: {
        user: user,
        link: `${settings.site.url}/reset/${uidb64}/${token}`,
        ...locals,
      },
    });
  } catch (error) {
    console.error(error);
  }
};
const sendWelcomeEmail = async user => {};
module.exports = {
  email,
  sendActivationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendInviteEmail,
};
