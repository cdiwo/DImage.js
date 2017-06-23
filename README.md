# HTML5 格式图片压缩、翻转插件
# DImage.js

## 使用方法

##### DImage

CommonJS 方式引用
```js
var DImage = require('diamge');
```

AMD 方式引用
```js
define(['dimage'], function(DImage) {
    // ...
});
```

全局方式，在HTML页面中引入:
```html
<script src="dimage.min.js"></script>
```

### Javascript代码


代码片段：
```js
var opts = {
    // 最大宽高
    width: 1280,
    height: 1280,
    // 图片质量，只有type为`image/jpeg`的时候才有效。
    quality: 90,
    // 是否保留头部meta信息。
    preserveHeaders: true,
    // 自动执行压缩
    autoCompress: false
}
var file = e.target.files[0];// 文件对象
// 方法一:
new DImage(file, opts, function(me) {
    var blob = me.resize().rotate().getAsBlob();
    var base64 = me.getAsBase64();
    
    // TODO
    // more code...
});
// 方法二:
DImage.create(file, opts, function(me) {});

```


## 参数
### 
<table>
<thead>

<tr>
  <th>参数</th>
  <th>类型</th>
  <th>默认值</th>
  <th>说明</th>
</tr>
</thead>
<tbody>
<tr><th colspan="4">构造参数</th></tr>
<tr>
  <td>file</td>
  <td>File 对象</td>
  <td></td>
  <td>图片文件对象</td>
</tr>
<tr>
  <td>opts</td>
  <td>object</td>
  <td>{}</td>
  <td>可选参数</td>
</tr>
<tr>
  <td>callback</td>
  <td>function</td>
  <td></td>
  <td>初始化完成后的回调函数</td>
</tr>
<tr>
  <th colspan="4">opts 参数</th>
</tr>
<tr>
  <td>width</td>
  <td>number</td>
  <td>1280</td>
  <td>最大宽度</td>
</tr>
<tr>
  <td>height</td>
  <td>number</td>
  <td>1280</td>
  <td>最大高度</td>
</tr>
<tr>
  <td>quality</td>
  <td>number</td>
  <td>90</td>
  <td>图片质量，只有type为`image/jpeg`的时候才有效</td>
</tr>
<tr>
  <td>preserveHeaders</td>
  <td>boolean</td>
  <td>true</td>
  <td>是否保留头部meta信息</td>
</tr>
<tr>
  <td>autoCompress</td>
  <td>boolean</td>
  <td>false</td>
  <td>开启自动压缩</td>
</tr>
<tr>
  <td>debug</td>
  <td>boolean</td>
  <td>false</td>
  <td>开启调试信息</td>
</tr>
<tr>
  <th colspan="4">外部方法（支持链式访问）</th>
</tr>
<tr>
  <td>resize</td>
  <td>function</td>
  <td></td>
  <td>压缩</td>
</tr>
<tr>
  <td>rotate</td>
  <td>function</td>
  <td></td>
  <td>翻转</td>
</tr>
<tr>
  <td>getAsBlob</td>
  <td>function</td>
  <td></td>
  <td>获取 `Blob` 输出</td>
</tr>
<tr>
  <td>getAsBase64</td>
  <td>function</td>
  <td></td>
  <td>获取 `Base64` 输出</td>
</tr>
</tbody></table>

### 更新日志

### 1.1.0 - 2017/06/23
1. 将图片处理独立为一个组件 `DImage.js`
2. 新增图片翻转功能

### 1.0.0 - 2017/03/20
1. 新增 `compress` 参数，使用HTML5进行JPEG图片压缩