/**
 * DImage.js
 * Image Resize and Rotate Plugin
 * Author: David Wei <weiguangchun@gmail.com>
 * Copyright: (c)2017 CDIWO Inc. All Copyright Reserved.
 * GitHub: https://github.com/cdiwo/DImage.js
 * CreateDate: 2017-03-20 16:00
 */
;(function () {

    "use strict";
    /**********
     * 图片类 *
     **********/
    var DImage = function (file, opts, handleInit) {
        var me = this;
        var BLANK = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';
        var UrlAPI = window.createObjectURL && window ||
            window.URL && URL.revokeObjectURL && URL ||
            window.webkitURL;

        var defaults = {
            // 最大宽高
            width: 1280,
            height: 1280,
            // 图片质量，只有type为`image/jpeg`的时候才有效。
            quality: 90,
            // 是否保留头部meta信息。
            preserveHeaders: true,
            // 自动执行压缩
            autoCompress: false,
            // debug
            debug: false
        };

        for (var param in opts) {
            defaults[param] = opts[param];
        }

        me.opts = defaults;
        me.debug = me.opts.debug;
        me.version = "1.1.0";

        me.init = function () {
            var img = new Image();
            img.onload = function () {
                // 读取meta信息。
                if (!me._metas && 'image/jpeg' === me.type) {
                    me.parse(file, function (error, ret) {
                        if (!error) {
                            me._metas = ret;
                        }
                        me.inited();
                    });
                } else {
                    me.inited();
                }
            };
            img.onerror = function () {
                // me.trigger('error');
                console.log('image load error');
            };

            img.src = UrlAPI.createObjectURL(file);

            me.type = file.type;
            me._img = img;
        };

        me.inited = function () {
            if (me.opts.autoCompress) {
                me.resize();
            }
            handleInit && handleInit(me);
        };

        me.destroy = function () {
            var canvas = this._canvas;
            this._img.onload = null;

            if (canvas) {
                canvas.getContext('2d')
                    .clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = canvas.height = 0;
                this._canvas = null;
            }

            // 释放内存。非常重要，否则释放不了image的内存。
            this._img.src = BLANK;
            this._img = null;
        };

        me.dataURL2Blob = function (base64) {
            var byteStr, intArray, ab, i, mimetype, parts;

            parts = base64.split(',');

            if (~parts[0].indexOf('base64')) {
                byteStr = atob(parts[1]);
            } else {
                byteStr = decodeURIComponent(parts[1]);
            }

            ab = new ArrayBuffer(byteStr.length);
            intArray = new Uint8Array(ab);

            for (i = 0; i < byteStr.length; i++) {
                intArray[i] = byteStr.charCodeAt(i);
            }

            mimetype = parts[0].split(':')[1].split(';')[0];

            return this.arrayBufferToBlob(ab, mimetype);
        };

        me.dataURL2ArrayBuffer = function (base64) {
            var byteStr, intArray, i, parts;

            parts = base64.split(',');

            if (~parts[0].indexOf('base64')) {
                byteStr = atob(parts[1]);
            } else {
                byteStr = decodeURIComponent(parts[1]);
            }

            intArray = new Uint8Array(byteStr.length);

            for (i = 0; i < byteStr.length; i++) {
                intArray[i] = byteStr.charCodeAt(i);
            }

            return intArray.buffer;
        };

        me.arrayBufferToBlob = function (buffer, type) {
            var builder = window.BlobBuilder || window.WebKitBlobBuilder,
                bb;

            // android不支持直接new Blob, 只能借助blobbuilder.
            if (builder) {
                bb = new builder();
                bb.append(buffer);
                return bb.getBlob(type);
            }

            return new Blob([buffer], type ? {type: type} : {});
        };

        me.getAsBlob = function () {
            var me = this,
                canvas = this._canvas,
                base64, buffer, blob;

            try {
                // android下面canvas.toDataUrl不支持jpeg，得到的结果是png.
                if (this.type === 'image/jpeg') {
                    base64 = canvas.toDataURL(this.type, me.opts.quality / 100);

                    if (me.opts.preserveHeaders && this._metas && this._metas.imageHead) {
                        buffer = me.dataURL2ArrayBuffer(base64);
                        buffer = me.updateImageHead(buffer, this._metas.imageHead);
                        blob = me.arrayBufferToBlob(buffer, this.type);
                        return blob;
                    }
                } else {
                    base64 = canvas.toDataURL(this.type);
                }
                blob = this.dataURL2Blob(base64);

            } catch (e) {
                // 出错了直接继续
            }
            return blob;
        };

        me.getAsBase64 = function () {
            var me = this,
                canvas = this._canvas,
                base64;

            // android下面canvas.toDataUrl不支持jpeg，得到的结果是png.
            if (me.type === 'image/jpeg') {
                base64 = canvas.toDataURL(me.type, me.opts.quality / 100);
            } else {
                base64 = canvas.toDataURL(me.type);
            }

            return base64;
        };

        me.rotate = function () {
            var canvas = this._canvas || (this._canvas = document.createElement('canvas'));

            // 翻转图片
            var orientation = me._metas && me._metas.orientation ? me._metas.orientation : 1;
            if (orientation != 1) {
                me._rotate(this._img, canvas, orientation);
            }

            return this;
        };

        me._rotate = function (img, cvs, orientation) {
            var ctx = cvs.getContext('2d'),
                width = cvs.width,
                height = cvs.height;

            // 对于未缩小的图片，需要使用原图进行翻转
            if (!cvs.getAttribute('hasResetWH')) {
                width = img.width;
                height = img.height;
            }

            switch (orientation) {
                case 6://需要顺时针90度旋转
                    cvs.width = height;
                    cvs.height = width;
                    // 旋转角度以弧度值计，
                    // 角度值使用 degrees * Math.PI / 180 公式进行计算
                    ctx.rotate(Math.PI / 2);
                    ctx.drawImage(img, 0, -height, width, height);
                    break;
                case 8://需要逆时针90度旋转
                    cvs.width = height;
                    cvs.height = width;
                    ctx.rotate(-Math.PI / 2);
                    ctx.drawImage(img, -width, 0, width, height);
                    break;
                case 3://需要180度旋转
                    ctx.rotate(Math.PI);
                    ctx.drawImage(img, -width, -height, width, height);
                    break;
            }
            if (me.debug) console.log('width, height, canvas.width, canvas.height', width, height, cvs.width, cvs.height);
        };

        me.resize = function () {
            var canvas = this._canvas || (this._canvas = document.createElement('canvas')),
                img = this._img,
                width = me.opts.width,
                height = me.opts.height;

            // 缩放图片
            me._resize(img, canvas, width, height);

            return this;
        };

        me._resize = function (img, cvs, width, height) {
            var ctx = cvs.getContext('2d'),
                naturalWidth = img.width,
                naturalHeight = img.height,
                scale, w, h;

            // 如果 width 的值介于 0 - 1
            // 说明设置的是百分比。
            if (width <= 1 && width > 0) {
                width = naturalWidth * width;
            }
            // 同样的规则应用于 height
            if (height <= 1 && height > 0) {
                height = naturalHeight * height;
            }

            scale = Math.min(width / naturalWidth, height / naturalHeight);

            // 不允许放大
            scale = Math.min(1, scale);

            w = naturalWidth * scale;
            h = naturalHeight * scale;

            if (me.debug) console.log('naturalHeight, naturalWidth, w, h', naturalHeight, naturalWidth, w, h);

            cvs.width = w;
            cvs.height = h;
            cvs.setAttribute('hasResetWH', true);

            ctx.drawImage(img, 0, 0, w, h);
        };

        me.parse = function (blob, cb) {
            var fr = new FileReader(),
                maxMetaDataSize = 262144;

            fr.onload = function () {
                cb(false, me._parse(this.result));
                fr = fr.onload = fr.onerror = null;
            };

            fr.onerror = function (e) {
                cb(e.message);
                fr = fr.onload = fr.onerror = null;
            };

            blob = blob.slice(0, maxMetaDataSize);
            fr.readAsArrayBuffer(blob);
        };

        me.readOrientationEXIFData = function (file, start) {
            function getStringFromDB(buffer, start, length) {
                var str = "", n;
                for (n = start; n < start + length; n++) {
                    str += String.fromCharCode(buffer.getUint8(n));
                }
                return str;
            }

            if (getStringFromDB(file, start, 4) != "Exif") {
                if (me.debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
                return false;
            }

            var littleEndian,
                tiffOffset = start + 6;

            // test for TIFF validity and endianness
            if (file.getUint16(tiffOffset) == 0x4949) {
                littleEndian = true;
            } else if (file.getUint16(tiffOffset) == 0x4D4D) {
                littleEndian = false;
            } else {
                if (me.debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
                return false;
            }

            if (file.getUint16(tiffOffset + 2, littleEndian) != 0x002A) {
                if (me.debug) console.log("Not valid TIFF data! (no 0x002A)");
                return false;
            }

            var firstIFDOffset = file.getUint32(tiffOffset + 4, littleEndian);
            if (firstIFDOffset < 0x00000008) {
                if (me.debug) console.log("Not valid TIFF data! (First offset less than 8)", firstIFDOffset);
                return false;
            }

            // Read Tags,
            // Just Read Orientation(0x0112) Tag
            var orientation = 1,
                dirStart = tiffOffset + firstIFDOffset,
                entries = file.getUint16(dirStart, littleEndian),
                entryOffset, i, tag;

            for (i = 0; i < entries; i++) {
                entryOffset = dirStart + i * 12 + 2;
                tag = file.getUint16(entryOffset, littleEndian);
                if (tag == '0x0112') {
                    orientation = file.getUint16(entryOffset + 8, littleEndian);
                }
            }

            return orientation;
        };

        me._parse = function (buffer) {
            if (buffer.byteLength < 6) {
                return;
            }

            var dataView = new DataView(buffer),
                offset = 2,
                maxOffset = dataView.byteLength - 4,
                ret = {},
                markerBytes, markerLength;

            if (me.debug) console.log("Got file of length " + buffer.byteLength);
            if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
                if (me.debug) console.log("Not a valid JPEG");
                return ret;
            }

            if (dataView.getUint16(0) === 0xffd8) {

                while (offset < maxOffset) {
                    markerBytes = dataView.getUint16(offset);
                    if (me.debug) console.log(markerBytes);

                    if (markerBytes >= 0xffe0 && markerBytes <= 0xffef ||
                        markerBytes === 0xfffe) {

                        if (markerBytes == 0xFFE1) {// 225
                            if (me.debug) console.log("Found 0xFFE1 marker");
                            ret.orientation = me.readOrientationEXIFData(dataView, offset + 4);
                        }

                        markerLength = dataView.getUint16(offset + 2) + 2;

                        if (offset + markerLength > dataView.byteLength) {
                            break;
                        }

                        offset += markerLength;
                    } else {
                        break;
                    }
                }

                if (offset > 6) {
                    // Workaround for IE10, which does not yet
                    // support ArrayBuffer.slice:
                    ret.imageHead = new Uint8Array(buffer).subarray(2, offset);
                }
            }

            return ret;
        };

        me.updateImageHead = function (buffer, head) {
            var data = this._parse(buffer),
                bodyOffset = 2,
                buf1, buf2;

            // buffer可能含有head信息
            if (data.imageHead) {
                bodyOffset += data.imageHead.byteLength;
            }

            buf2 = new Uint8Array(buffer).subarray(bodyOffset);
            buf1 = new Uint8Array(head.byteLength + 2 + buf2.byteLength);
            buf1[0] = 0xFF;
            buf1[1] = 0xD8;
            buf1.set(new Uint8Array(head), 2);
            buf1.set(new Uint8Array(buf2), head.byteLength + 2);

            return buf1.buffer;
        };

        me.init();
    };

    DImage.create = function (file, opts, callback) {
        return new DImage(file, opts, callback)
    };

    // exports [AMD/RequireJS/Global]
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return DImage;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = DImage;
    } else {
        (typeof window !== 'undefined' ? window : this).DImage = DImage;
    }
})();
