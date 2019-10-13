const trumpet = require('node-trumpet2');
const through = require('through');
const through2 = require('through2');

const { getAssetsPath } = require('./build');
const settings = require('../settings');

const validPath = /(http|ftp|https|data):/;
const urlRegex = /url\((?!['"]?(?:data|http|https|ftp):)['"]?([^'"\)]*)['"]?\)/g;

const replaceUrl = (assets, str, assetsUrl, relativePath) => {
  const replacer = (match, p1, offset, str) => {
    const asset = findAsset(assets, p1, relativePath);
    if (asset) {
      let url = `url(${assetsUrl}/${getAssetsPath(
        asset.relativePath,
        asset.sha,
      )}`;
      if (settings.s3.privateAssets) {
        url = `${url}?token=${settings.token})`
      }
      return url;
    }
    return `url(${p1})`;
  };
  return str.replace(urlRegex, replacer);
};

const convertUrl = (assets, assetsUrl, relativePath) =>
  through(function(buf) {
    const str = buf.toString();
    this.queue(replaceUrl(assets, str, assetsUrl, relativePath));
  });

const findAsset = (assets, path, relativePath) => {
  const modifiedPath = path[0] === '/' ? path.slice(1) : path;
  const fullPath = relativePath
    ? `${relativePath}/${modifiedPath}`
    : modifiedPath;
  return assets.find(a => a.relativePath === fullPath);
};

const transformHTML = (assets, assetsUrl, relativePath) => {
  const updateAttribute = (name, element) => {
    const attribute = element.getAttribute(name);
    if (!validPath.test(attribute)) {
      const asset = findAsset(assets, attribute);
      if (asset) {
        let url = `${assetsUrl}/${getAssetsPath(asset.relativePath, asset.sha)}`;
        if (settings.s3.privateAssets) {
          url = `${url}?token=${settings.token})`
        }
        element.setAttribute(
          name,
          url,
        );
      }
    }
  };
  const stream = trumpet();

  stream.selectAll('img[src]', element => updateAttribute('src', element));
  stream.selectAll('script[src]', element => updateAttribute('src', element));
  stream.selectAll('link[href]', element => updateAttribute('href', element));
  stream.selectAll('style', element => {
    let elementStream = element.createStream();
    elementStream
      .pipe(convertUrl(assets, assetsUrl, relativePath))
      .pipe(elementStream);
  });

  return stream;
};

const transformCSS = (assets, assetsUrl, relativePath) => {
  const openMatcher = 123; // {
  const closeMatcher = 125; // }
  let isOpen = false;
  let isClosed = false;
  let openCount = 0;
  let chunks;

  function write(chunk, enc, cb) {
    let offset = 0;
    let buffer;
    if (chunks) {
      buffer = Buffer.concat([chunks, chunk]);
      offset = chunks.length;
      chunks = null;
    } else {
      buffer = chunk;
    }

    let openIndex = null;
    let closeIndex = null;
    while (offset < buffer.length) {
      const token = buffer[offset];
      if (token === openMatcher) {
        if (!isOpen) {
          isOpen = true;
          isClosed = false;
          openIndex = offset;
        }
        openCount++;
      }
      if (token === closeMatcher) {
        if (isOpen) {
          openCount--;
          if (openCount === 0) {
            isClosed = true;
            isOpen = false;

            const previousBuffer = buffer.slice(0, openIndex);
            const bufferString = buffer.slice(openIndex, offset + 1).toString();

            let replacedString = replaceUrl(
              assets,
              bufferString,
              assetsUrl,
              relativePath,
            );
            const replacedBuffer = Buffer.from(replacedString);
            const remainingBuffer = buffer.slice(offset + 1);
            offset += replacedBuffer.length - bufferString.length; // offset could be smaller if url is smaller
            closeIndex = offset;
            buffer = Buffer.concat([
              previousBuffer,
              replacedBuffer,
              remainingBuffer,
            ]);
          }
        }
      }
      offset++;
    }
    if (isOpen && !isClosed) {
      this.push(buffer.slice(0, closeIndex));
      chunks = buffer.slice(closeIndex);
    } else {
      chunks = null;
      this.push(buffer);
    }
    cb();
  }

  function end(cb) {
    if (chunks) {
      this.push(chunks);
      chunks = null;
    }
    cb();
  }
  return through2(write, end);
};

module.exports = {
  transformHTML,
  convertUrl,
  transformCSS,
  replaceUrl,
  findAsset,
};
