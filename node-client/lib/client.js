const util = require('util');
const request = util.promisify(require('request'));

class Client {
  constructor(bassetUrl, token) {
    this.bassetUrl = bassetUrl;
    this.token = token;
  }

  async request(options) {
    const maxAttempts = 3;
    let attempts = 1;
    const errors = [];
    return new Promise((resolve, reject) => {
      const makeRequest = async () => {
        attempts++;
        try {
          const response = await request(options);
          if ([500, 502, 503, 504].includes(response.statusCode)) {
            throw new Error(
              `${response.statusCode}: ${response.statusMessage}`,
            );
          }
          resolve(response);
        } catch (error) {
          errors.push(error);
          if (attempts <= maxAttempts) {
            setTimeout(() => makeRequest(), 100);
          } else {
            reject(errors);
          }
        }
      };
      return makeRequest();
    });
  }

  async buildStart(data) {
    const options = {
      url: `${this.bassetUrl}/build/start`,
      method: 'POST',
      json: true,
      headers: {
        authorization: `Token ${this.token}`,
      },
      body: data,
    };
    try {
      const { body, statusCode, statusMessage } = await this.request(options);
      if (statusCode !== 200) {
        throw new Error(`${statusCode}: ${statusMessage}`);
      }
      const { id, assets } = body; // body has already been parsed due to json: true on options.
      this.buildId = id;
      console.log(id, assets);
      return { id, assets };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async uploadSnapshot(snapshot, relativePath, sha, file) {
    const { title, widths, selectors, browsers, hideSelectors } = snapshot;
    const { body, statusCode, statusMessage } = await this.request({
      url: `${this.bassetUrl}/build/upload/snapshot`,
      method: 'POST',
      headers: {
        authorization: `Token ${this.token}`,
        'x-build-id': this.buildId,
        'x-relative-path': relativePath,
        'x-sha': sha,
      },
      formData: {
        snapshot: {
          value: file,
          options: {
            filename: `${title}.html`,
            contentType: 'text/html',
          },
        },
        widths: widths || '',
        title,
        selectors: selectors || '',
        hideSelectors: hideSelectors || '',
        browsers: browsers || '',
      },
    });
    const { uploaded } = JSON.parse(body); // body is json
    console.log('Uploaded snapshot');
    if (!uploaded) {
      throw new Error(`There was a problem uploading this snapshot: ${title}`);
    }
    console.log(`Uploaded snapshot: ${title} widths: (${widths})`);
  }

  async uploadAsset(relativePath, sha, fileStream) {
    try {
      const { body, statusCode, statusMessage } = await this.request({
        url: `${this.bassetUrl}/build/upload/asset`,
        method: 'POST',
        headers: {
          authorization: `Token ${this.token}`,
          'x-build-id': this.buildId,
          'x-relative-path': relativePath,
          'x-sha': sha,
        },
        formData: {
          asset: fileStream,
        },
      });
      const { uploaded } = JSON.parse(body); // body is json
      if (!uploaded) {
        throw new Error(
          `There was a problem uploading this asset: ${relativePath}`,
        );
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async buildFinish() {
    try {
      const { body, statusCode, statusMessage } = await this.request({
        url: `${this.bassetUrl}/build/finish`,
        method: 'POST',
        headers: {
          authorization: `Token ${this.token}`,
        },
        body: {
          buildId: this.buildId,
        },
        json: true,
      });
      const { submitted } = body; // body is already parsed
      if (!submitted) {
        throw new Error('There was an issue finalizing this build.');
      }
      console.log('Finished build');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = {
  Client,
};
