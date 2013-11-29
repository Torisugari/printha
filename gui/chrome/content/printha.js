/*
* Copyright (C) 2013 Torisugari <torisugari@gmail.com>
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*/

Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://printha/csvparser.js");

var gPrinthaSettings = {
  get "font" () {
    return document.getElementById("font-list").selectedItem.value;
  },

  get "zipfont" () {
    return document.getElementById("zipfont-list").selectedItem.value;
  },

  set "font" (aValue) {
    document.getElementById("font-list").value = aValue;
  },

  set "zipfont" (aValue) {
    document.getElementById("zipfont-list").value = aValue;
  },

  set addressData(aData) {
    this._addressData = aData;
    var i;
    if (this._addressData.length > 0 && this._addressData[0].length > 3) {
      document.getElementById("csv.sendto.fname").value = this._addressData[0][0];
      document.getElementById("csv.sendto.sname").value = this._addressData[0][1];
      document.getElementById("csv.sendto.zipcode").value = this._addressData[0][2];
      document.getElementById("csv.sendto.address").value = this._addressData[0][3];
      if (this._addressData[0].length > 4 && this._addressData[0][4]) {
        document.getElementById("csv.sendto.address").value += 
          "\n" + this._addressData[0][4];
      }
    }
    else {
      document.getElementById("csv.sendto.fname").value = "";
      document.getElementById("csv.sendto.sname").value = "";
      document.getElementById("csv.sendto.zipcode").value = "";
      document.getElementById("csv.sendto.address").value = "";
    }

    for (i = 0; i < 6; i++) {
      document.getElementById("csv.sendto.extra[" + i + "]").value = 
       ((i + 5) < this._addressData[0].length)?
         this._addressData[0][i + 5] : "";
    }
  },

  get isDirectInput() {
    return document.getElementById("direct-input").selected;
  },

  get addressData() {
    if (this.isDirectInput) {
      return this.directInputData;
    }

    var length = this._addressData.length;
    var hono = this.hono;
    var extra = this.isExtraEnabled;
    var data = this.formatLine(this._addressData[0], hono, extra);
    for (var i = 1; i < length; i++) {
      var temp = this.formatLine(this._addressData[i], hono, extra);
      if (temp) {
        data += "|" + temp;
      }
    }
    return data;
  },

  get directInputData() {
    var data = document.getElementById("sendto.name").value + ";" +
               document.getElementById("sendto.zipcode").value + ";" +
               document.getElementById("sendto.address").value;
    if (this.isExtraEnabled) {
      for (var i = 0; i < 6; i++) {
        data += ";" + document.getElementById("sendto.extra[" + i + "]").value;
      }
    }
    return data;
  },

  get firstAddressData() {
    if (this.isDirectInput) {
      this.directInputData;
    }

    return this.formatLine(this._addressData[0], this.hono, this.isExtraEnabled);
  },

  set sendfromData(aData) {
    var data = aData.split(";")

    while(data.length < 3) {
      data.push("");
    }

    document.getElementById("sendfrom.name").value = data[0];
    document.getElementById("sendfrom.zipcode").value = data[1];
    document.getElementById("sendfrom.address").value = data[2];

    for (var i = 0; i < 6; i++) {
      document.getElementById("sendfrom.extra[" + (i).toString() + "]")
              .value = ((i + 3) < data.length)? data[i + 3] : "";
    }
  },

  get sendfromData() {
    var val = document.getElementById("sendfrom.name").value + ";" +
              document.getElementById("sendfrom.zipcode").value + ";" +
              document.getElementById("sendfrom.address").value;
    if (!this.isExtraEnabled)
      return val;

    for (var i = 0; i < 6; i++) {
      val += ";" + document.getElementById("sendfrom.extra[" + i + "]").value;
    }
    return val;
  },

  formatLine: function (aLine, aHonorifics, aExtra) {
    if (!aLine || aLine.length < 4) {
      return "";
    }
    var data = aLine[0] + " " + aLine[1] + aHonorifics + ";"
                        + aLine[2] + ";" + aLine[3];
    if (aLine.length > 4 && aLine[4]) {
      data += "\n" + aLine[4];
    }

    if (!aExtra) {
      return data;
    }

    var length = ((5 + 6) < aLine.length )? (5 + 6) : aLine.length;
    for (var i = 5; i < length; i++) {
      data += ";" + aLine[i];
    }

    return data;
  },

  get configData() {
    var data = "";
    for (var i in this.configKeys) {
      var key = this.configKeys[i]; 
      data += key + " " + this[key] + "\n";
    }
    for (var i in this.configValueKeys) {
      var key = this.configValueKeys[i]; 
      data += key + " " + document.getElementById(key).value + "\n";
    }
    for (var i in this.configCheckedKeys) {
      var key = this.configCheckedKeys[i]; 
      data += key + " " + document.getElementById(key).checked + "\n";
    }
    return data;
  },

  set configData(aValue) {
    var lines = aValue.split("\n");
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      if (!line || line.charAt(0) == "#") {
        continue;
      }
      const reg = /^([a-zA-Z0-9\.\[\]]+)/;
      if (reg.test(line)) {
        var key = RegExp.$1;
        var value = line.replace(reg, "").trim();
        var found = false;
        if (key == "font") {
          this["font"] = value;
          continue;
        }

        if (key == "zipfont") {
          this["zipfont"] = value;
          continue;
        }

        for (var i in this.configValueKeys) {
          if (key == this.configValueKeys[i]) {
            document.getElementById(key).value = value;
            found = true;
            break;
          }
        }

        if (found) {
          continue;
        }

        for (var i in this.configCheckedKeys) {
          if (key == this.configCheckedKeys[i]) {
            if (value == "true") {
              document.getElementById(key).checked = true;
              break;
            }
            else if (value == "false") {
              document.getElementById(key).checked = false;
              break;
            }
          }
        }
      }
    }
  },

  get hono() {
    var val = document.getElementById("csv.sendto.honorifics").value;
    return val? val : "";
  },

  configKeys: ["sendfrompath", "outputpath", "font", "zipfont"],
  configValueKeys: [
    "sendto.zipfontsize",
    "sendfrom.zipfontsize",
    "sendto.name.fontsize",
    "sendto.addr.fontsize",
    "sendfrom.addr.fontsize",
    "sendfrom.name.fontsize",
    "sendfrom_zipframe_offset",
    "sendfrom.addr.whitespace",
    "sendfrom.name.whitespace",
    "sendto.addr.whitespace",
    "sendto.name.whitespace",
    "sendto.name.rect",
    "sendto.addr.rect",
    "sendfrom.name.rect",
    "sendfrom.addr.rect",
    "sendto.extra[0].rect",
    "sendto.extra[0].whitespace",
    "sendto.extra[0].fontsize",
    "sendto.extra[1].rect",
    "sendto.extra[1].whitespace",
    "sendto.extra[1].fontsize",
    "sendto.extra[2].rect",
    "sendto.extra[2].whitespace",
    "sendto.extra[2].fontsize",
    "sendto.extra[3].rect",
    "sendto.extra[3].whitespace",
    "sendto.extra[3].fontsize",
    "sendto.extra[4].rect",
    "sendto.extra[4].whitespace",
    "sendto.extra[4].fontsize",
    "sendto.extra[5].rect",
    "sendto.extra[5].whitespace",
    "sendto.extra[5].fontsize",
    "sendfrom.extra[0].rect",
    "sendfrom.extra[0].whitespace",
    "sendfrom.extra[0].fontsize",
    "sendfrom.extra[1].rect",
    "sendfrom.extra[1].whitespace",
    "sendfrom.extra[1].fontsize",
    "sendfrom.extra[2].rect",
    "sendfrom.extra[2].whitespace",
    "sendfrom.extra[2].fontsize",
    "sendfrom.extra[3].rect",
    "sendfrom.extra[3].whitespace",
    "sendfrom.extra[3].fontsize",
    "sendfrom.extra[4].rect",
    "sendfrom.extra[4].whitespace",
    "sendfrom.extra[4].fontsize",
    "sendfrom.extra[5].rect",
    "sendfrom.extra[5].whitespace",
    "sendfrom.extra[5].fontsize"
  ],
  configCheckedKeys: [
    "sendto.extra[0].stretch",
    "sendto.extra[0].bottom",
    "sendto.extra[1].stretch",
    "sendto.extra[1].bottom",
    "sendto.extra[2].stretch",
    "sendto.extra[2].bottom",
    "sendto.extra[3].stretch",
    "sendto.extra[3].bottom",
    "sendto.extra[4].stretch",
    "sendto.extra[4].bottom",
    "sendto.extra[5].stretch",
    "sendto.extra[5].bottom",

    "sendfrom.extra[0].stretch",
    "sendfrom.extra[0].bottom",
    "sendfrom.extra[1].stretch",
    "sendfrom.extra[1].bottom",
    "sendfrom.extra[2].stretch",
    "sendfrom.extra[2].bottom",
    "sendfrom.extra[3].stretch",
    "sendfrom.extra[3].bottom",
    "sendfrom.extra[4].stretch",
    "sendfrom.extra[4].bottom",
    "sendfrom.extra[5].stretch",
    "sendfrom.extra[5].bottom",
    "drawnenga",
    "sendto.drawzipframe",
    "sendfrom.drawzipframe",
    "sendto.name.stretch",
    "sendto.addr.stretch",
    "sendfrom.name.stretch",
    "sendfrom.addr.stretch",
    "sendto.name.bottom",
    "sendto.addr.bottom",
    "sendfrom.name.bottom",
    "sendfrom.addr.bottom"
  ],
  configValuesKeys: [
  ],
  valuesById: function(aId) {
    var values = "";
    var children = document.getElementById(aId).getElementsByTagName("textbox");
    var i;
    for (i = 0; i < children.length; i++) {
      values += " " + children[i].value;
    }
    return values;
  },
  "sendfrompath" : "",
  "outputpath" : "",
  get isExtraEnabled() {
    return document.getElementById("extra.enabled").checked;
  },
  config : "",
  svgpath: "",
  isPreview: false,
  binpath: "",
  _addressData: [["","","",""]]
};

function toggleExtra (aHidden) {
  document.getElementById('sendfrom.extra').hidden = aHidden;
  document.getElementById('sendto.extra').hidden = aHidden;
  document.getElementById('csv.sendto.extra').hidden = aHidden;

  var sendfromStyle = document.getElementById('style.sendfrom.extra');
  var sendtoStyle = document.getElementById('style.sendto.extra');
  sendfromStyle.hidden = aHidden;
  sendtoStyle.hidden = aHidden;

  if (aHidden && (sendfromStyle.selected || styleSendto.selcted)) {
    sendfromStyle.parentNode.selectedIndex = 0;
  }

  window.sizeToContent();
}

function selectCSV() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "CSVファイルの選択",
          Components.interfaces.nsIFilePicker.modeOpen);
 
  fp.appendFilter("CSVファイル (*.csv)", "*.csv");

  var rv = fp.show();
  if (rv != Components.interfaces.nsIFilePicker.returnOK &&
      rv != Components.interfaces.nsIFilePicker.returnReplace) {
    return;
  }

  document.getElementById("csv-path").value = fp.file.path;

  function callback(aInputStream, aStatus) {
    if (!Components.isSuccessCode(aStatus)) {
      return;
    }

    const rc = Components.interfaces.nsIConverterInputStream
                                    .DEFAULT_REPLACEMENT_CHARACTER;
    const kOption = {
      charset: "utf-8",
      eplacement: Components.interfaces.nsIConverterInputStream
                            .DEFAULT_REPLACEMENT_CHARACTER
    };
    var data = NetUtil.readInputStreamToString(aInputStream,
                                               aInputStream.available(),
                                               kOption);
    gPrinthaSettings.addressData = parseCSV(data);
  }

  NetUtil.asyncFetch(fp.file, callback);
}

function loadConfig() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "設定ファイルの選択",
          Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv != Components.interfaces.nsIFilePicker.returnOK &&
      rv != Components.interfaces.nsIFilePicker.returnReplace) {
    return;
  }

  function callback(aInputStream, aStatus) {
    if (!Components.isSuccessCode(aStatus)) {
      return;
    }

    const rc = Components.interfaces.nsIConverterInputStream
                                    .DEFAULT_REPLACEMENT_CHARACTER;
    const kOption = {
      charset: "utf-8",
      eplacement: Components.interfaces.nsIConverterInputStream
                            .DEFAULT_REPLACEMENT_CHARACTER
    };
    gPrinthaSettings.configData =
      NetUtil.readInputStreamToString(aInputStream, aInputStream.available(),
                                      kOption);
  }

  NetUtil.asyncFetch(fp.file, callback);
}

function saveTextFile(aData, aFileLeaf) {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "保存先の選択",
          Components.interfaces.nsIFilePicker.modeSave);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterText);
  fp.defaultString = aFileLeaf;
  var rv = fp.show();
  if (rv != Components.interfaces.nsIFilePicker.returnOK &&
      rv != Components.interfaces.nsIFilePicker.returnReplace) {
    return;
  }

  var suc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Components.interfaces
                                                .nsIScriptableUnicodeConverter);
  suc.charset = "utf-8";
  var is = suc.convertToInputStream(aData);
  var os = FileUtils.openSafeFileOutputStream(fp.file)

  NetUtil.asyncCopy(is, os, function (aResult) {});

}

function saveConfig() {
  saveTextFile(gPrinthaSettings.configData, "printha.config.txt");
}

function loadSender() {
  var fp = Components.classes["@mozilla.org/filepicker;1"]
                     .createInstance(Components.interfaces.nsIFilePicker);
  fp.init(window, "テキストファイルの選択",
          Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv != Components.interfaces.nsIFilePicker.returnOK &&
      rv != Components.interfaces.nsIFilePicker.returnReplace) {
    return;
  }
  loadSenderFile(fp.file)
}

function saveSender() {
  saveTextFile(gPrinthaSettings.sendfromData, "sendfrom.txt");
}

function print(aIsPreview) {
  if (aIsPreview) {
    gPrinthaSettings.svgpath =
      FileUtils.getFile("TmpD", ["printha", "preview.svg"]).path;

    gPrinthaSettings["outputpath"] = gPrinthaSettings.svgpath;
  }
  else {
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                       .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, "保存先の選択",
            Components.interfaces.nsIFilePicker.modeSave);
    fp.appendFilter("PDFファイル (*.pdf)", "*.pdf");
    fp.defaultString = "printha.pdf"
    var rv = fp.show();
    if (rv != Components.interfaces.nsIFilePicker.returnOK &&
        rv != Components.interfaces.nsIFilePicker.returnReplace) {
      return;
    }

    gPrinthaSettings.svgpath = "about:blank";
    gPrinthaSettings["outputpath"] = fp.file.path;
  }
  gPrinthaSettings.isPreview = aIsPreview;
  var sendfromFile =
    FileUtils.getFile("TmpD", ["printha", "sendfrom.txt"]);

  gPrinthaSettings["sendfrompath"] = sendfromFile.path;

  var suc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Components.interfaces
                                                .nsIScriptableUnicodeConverter);
  suc.charset = "utf-8";
  var is = suc.convertToInputStream(gPrinthaSettings.sendfromData);
  var os = FileUtils.openSafeFileOutputStream(sendfromFile)

  NetUtil.asyncCopy(is, os, print2);
}

function print2(aStatus) {
  try {
    var configFile =
      FileUtils.getFile("TmpD", ["printha", "config.txt"]);

    gPrinthaSettings.config = configFile.path;

    var suc = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                        .createInstance(Components.interfaces
                                                  .nsIScriptableUnicodeConverter);
    suc.charset = "utf-8";
    var is = suc.convertToInputStream(gPrinthaSettings.configData);
    var os = FileUtils.openSafeFileOutputStream(configFile)

    NetUtil.asyncCopy(is, os, print3);
  }
  catch(e) {
    alert(e + e.lineNumber);
  }
}

var previewObserver = {
  observe: function (aSubject, aTopic, aData) {
    var browser = document.getElementById("content");
    if (aTopic != "process-finished") {
      if (browser.currentURI.spec != "about:blank") {
        browser.loadURI("about:blank", null, null);
      }
    }
    var io = Components.classes['@mozilla.org/network/io-service;1']
                       .getService(Components.interfaces.nsIIOService);
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(gPrinthaSettings.svgpath);
    var fileURI = io.newFileURI(file);
    if (fileURI.equals(browser.currentURI)) {
      const flag =
        Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_HISTORY |
        Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_CACHE;
      browser.reload();
    }
    else {
      browser.loadURI(fileURI.spec);
    }
  },

  QueryInterface: function(aIID) {
    if(!aIID.equals(CI.nsISupports) && !aIID.equals(CI.nsIObserver))
      throw CR.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

function print3(aStatus) {
  try {
    var process = Components.classes["@mozilla.org/process/util;1"]
                            .createInstance(Components.interfaces.nsIProcess);
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(gPrinthaSettings.binpath);
    process.init(file);

    var args = ["--import", gPrinthaSettings.config];
    if (gPrinthaSettings.isPreview) {
      args.push("--preview");
      args.push("--svg");
      args.push(gPrinthaSettings.firstAddressData);
    }
    else{
      args.push(gPrinthaSettings.addressData);
    }
    process.runwAsync(args, args.length, previewObserver, false);
  }
  catch(e) {
    alert(e);
  }
}

function loadSenderFile(aFile) {
  function callback(aInputStream, aStatus) {
    if (!Components.isSuccessCode(aStatus)) {
      return;
    }

    const rc = Components.interfaces.nsIConverterInputStream
                                    .DEFAULT_REPLACEMENT_CHARACTER;
    const kOption = {
      charset: "utf-8",
      eplacement: Components.interfaces.nsIConverterInputStream
                            .DEFAULT_REPLACEMENT_CHARACTER
    };
    gPrinthaSettings.sendfromData =
      NetUtil.readInputStreamToString(aInputStream, aInputStream.available(),
                                      kOption);
  }

  NetUtil.asyncFetch(aFile, callback);
}

function startup(aEvent) {
  var fl = Components.classes["@mozilla.org/gfx/fontenumerator;1"]
                     .createInstance(Components.interfaces.nsIFontEnumerator);
  var size = {};
  var names = fl.EnumerateAllFonts(size);

  var i;
  var fontlist = document.getElementById("font-list");
  for (i = 0; i < size.value; i++) {
    fontlist.appendItem(names[i], names[i], fl.getDefaultFont("ja", names[i]));
  }

  fontlist = document.getElementById("zipfont-list");
  for (i = 0; i < size.value; i++) {
    fontlist.appendItem(names[i], names[i], fl.getDefaultFont("ja", names[i]));
  }

  var cl = window.arguments[0]
                 .QueryInterface(Components.interfaces.nsICommandLine);

  gPrinthaSettings.binpath = cl.handleFlagWithParam("printha-bin", false);
  FileUtils.getDir("TmpD", ["printha"]);

  setTimeout(delayedStartup, 100);
}

function delayedStartup() {
  window.sizeToContent();
}

function enddown(aEvent) {
  var file = FileUtils.getDir("TmpD", ["printha"]);
  if (file.exists())
    file.remove(true);
}

window.addEventListener("unload", enddown, false);
window.addEventListener("load", startup, false);

function hNarrower(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sx = parseFloat(numbers[0].value) + 0.5;
  var ex = parseFloat(numbers[2].value) - 0.5;

  if (sx <= ex) {
    numbers[0].value = sx;
    numbers[2].value = ex;
  }
}

function vNarrower(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sy = parseFloat(numbers[1].value) + 0.5;
  var ey = parseFloat(numbers[3].value) - 0.5;

  if (sy <= ey) {
    numbers[1].value = sy;
    numbers[3].value = ey;
  }
}

function hWider(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sx = parseFloat(numbers[0].value) - 0.5;
  var ex = parseFloat(numbers[2].value) + 0.5;

  if ((parseFloat(numbers[0].min) <= sx) &&
      ex <= (parseFloat(numbers[2].max))) {
    numbers[0].value = sx;
    numbers[2].value = ex;
  }
}

function vWider(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sy = parseFloat(numbers[1].value) - 0.5;
  var ey = parseFloat(numbers[3].value) + 0.5;

  if ((parseFloat(numbers[1].min) <= sy) &&
      ey <= (parseFloat(numbers[3].max))) {
    numbers[1].value = sy;
    numbers[3].value = ey;
  }
}

function goLeft(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sx = parseFloat(numbers[0].value) - 1.0;
  var ex = parseFloat(numbers[2].value) - 1.0;

  if ((parseFloat(numbers[0].min) <= sx) &&
      (parseFloat(numbers[2].min) <= ex)) {
    numbers[0].value = sx;
    numbers[2].value = ex;
  }
}

function goRight(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sx = parseFloat(numbers[0].value) + 1.0;
  var ex = parseFloat(numbers[2].value) + 1.0;

  if ((parseFloat(numbers[0].max) >= sx) &&
      (parseFloat(numbers[2].max) >= ex)) {
    numbers[0].value = sx;
    numbers[2].value = ex;
  }
}

function goUp(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sy = parseFloat(numbers[1].value) - 1.0;
  var ey = parseFloat(numbers[3].value) - 1.0;

  if ((parseFloat(numbers[1].min) <= sy) &&
      (parseFloat(numbers[3].min) <= ey)) {
    numbers[1].value = sy;
    numbers[3].value = ey;
  }
}

function goDown(aElement) {
  var numbers = aElement.parentNode
                        .parentNode
                        .previousSibling.getElementsByTagName("textbox");
  var sy = parseFloat(numbers[1].value) + 1.0;
  var ey = parseFloat(numbers[3].value) + 1.0;

  if ((parseFloat(numbers[1].max) >= sy) &&
      (parseFloat(numbers[3].max) >= ey)) {
    numbers[1].value = sy;
    numbers[3].value = ey;
  }
}

