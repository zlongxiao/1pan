var wxdata, alidata, filename;
var editor

function isMobile() {
    var windowWidth = $(window).width();
    return windowWidth < 768;
}

function showpic(obj, id) {
    obj = obj.target;
    for (var i = 0, file; file = obj.files[i]; i++) {
        if (i > 0) {
            break;
        }
        var reader = new FileReader();
        reader.onload = function (e) {//图片读取展示
            console.log(e);
            var img = $(obj).parent().find("img")
            img.attr('src', e.target.result)
            compress(e.target.result, function (data) {
                if ($(obj).data("type") == "alipay") {
                    alidata = data
                } else {
                    wxdata = data
                }
            })
        }
        reader.readAsDataURL(file);
    }
}


function submit() {
    var $btn = $(this).button('loading')
    var txt, file, forcepay;
    if (isMobile()) {
        txt = $("#iptText").val()
    } else {
        txt = html2Escape(editor.txt.html());
    }
    txt = txt.substring(0, 20000)
    file = $('#filemd5').val();
    if (!file.trim()) {
        $btn.button('reset');
        bootoast({
            type: 'danger',
            message: '上传文件先',
            timeout: 2,
            position: 'top'
        });
        return;
    }
    forcepay = $("#iptforce").prop('checked') || false;
    if (forcepay && !(wxdata || alidata)) {
        $btn.button('reset')
        return
    }
    $.post("/page/add", {
        txt: txt,
        file: file,
        filename: filename || "未命名",
        wx: wxdata,
        alipay: alidata,
        secret: $("#iptsecret").val(),
        forcepay: forcepay
    }, function (result) {
        if (result.r == 200) {
            var modal = $('#modpublicsuccess')
            modal.find('.modal-body').html(html2decode(result.content));
            modal.modal();
            createCode(result.url, result.title.substring(0, 21))
        } else {
            bootoast({
                type: 'danger',
                message: '上传失败',
                position: 'top'
            });
        }
        $btn.button('reset')
        console.log(result);
    });
}

function html2Escape(sHtml) {
    return sHtml.replace(/[<>&"]/g, function (c) {
        return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
    });
};

function html2decode(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp": " ",
        "amp": "&",
        "quot": "\"",
        "lt": "<",
        "gt": ">"
    };
    return encodedString.replace(translate_re, function (match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function (match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

jQuery(function () {
    // $.ajax({headers:{'X-Requested-With':'XMLHttpRequest'}})
    if (!WebUploader.Uploader.support()) {
        alert('Web Uploader 不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级 flash 播放器');
        throw new Error('WebUploader does not support the browser you are using.');
    }
    //每个分片上传前
    // "after-send-file": "afterSendFile"  //分片上传完毕
    WebUploader.Uploader.register({
            "before-send-file": "beforeSendFile",//整个文件上传前
            "before-send": "beforeSend"
        },
        {
            beforeSendFile: function (file) {
                var deferred = WebUploader.Base.Deferred();
                uploader.md5File(file, 0, 9 * 1024 * 1024).progress(function (percentage) {
                    $('.webuploader-pick').text('读取文件信息');
                }).then(function (val) {
                    $('.webuploader-pick').text('文件信息成功');
                    file.fileMd5 = val;
                    deferred.resolve();
                });
                return deferred.promise();
            },
            beforeSend: function (block) {
                var deferred = WebUploader.Base.Deferred();
                block.file.chunks = block.chunks;
                $.ajax({
                    type: "POST",
                    url: filebase + "/upload/md5",
                    data: {
                        fileName: block.file.name,
                        fileMd5: block.file.fileMd5,
                        chunk: block.chunk,
                        chunkSize: block.end - block.start,
                    },
                    cache: false,
                    timeout: 1000,
                    dataType: "json"
                }).then(function (response, textStatus, jqXHR) {
                    if (response.ifExist) {
                        //分块存在，跳过
                        deferred.reject();
                    } else {
                        //分块不存在或不完整，重新发送该分块内容
                        deferred.resolve();
                    }
                }, function (jqXHR, textStatus, errorThrown) {    //任何形式的验证失败，都触发重新上传
                    //分块不存在或不完整，重新发送该分块内容
                    deferred.resolve();
                });
                return deferred.promise();
            },
            afterSendFile: function (file) {
                //第一步：先检查文件路径下是否存在该文件，如果存在则修改旧文件名称和文件状态
                var deferred = WebUploader.Base.Deferred();
                // mergeFile(file, null, null, deferred);
                return deferred.promise();
            }
        });
    // 实例化
    uploader = WebUploader.create({
        auto: true,
        pick: {
            id: '#filePicker',
            label: '+ 上传',
            multiple: false
        },
        // dnd: '#uploader .queueList',
        paste: document.body,
        accept: {
            title: 'File',
            extensions: '7z,mkv,dmg,msi,gif,jpg,jpeg,bmp,png,pdf,doc,docx,xls,xlsx,ppt,pptx,rar,zip,exe,iso,img,m4a,mp4,mov,avi,apk,gz,tar',
            mimeTypes: '*/*'
        },
        // swf文件路径
        swf: 'https://cdn.bootcdn.net/ajax/libs/webuploader/0.1.1/Uploader.swf',
        disableGlobalDnd: true,
        resize: false,
        chunked: true,
        chunkSize: 1024 * 1024 * 10,
        chunkRetry: 10,
        threads: 3,
        server: filebase + '/upload/upload',
        fileNumLimit: 1,
        fileSingleSizeLimit: 1024 * 1024 * 1024 * 5
    });
    //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
    uploader.on('uploadBeforeSend', function (block, data, headers) {
        data.fileMd5 = block.file.fileMd5;
        // block.file.chunks = block.chunks;//当前文件总分片数量
        data.chunks = block.file.chunks;
    });
    uploader.on('fileQueued', function (file) {
        $("#progress").fadeIn();
        uploader.upload(file.id);
    });
    uploader.on('uploadProgress', function (file, percentage) {
        var $percent = $('#process-bar');
        var percent = (percentage * 100).toFixed(2)
        $percent.css('width', percent + '%');
        var name = file.name.substring(0, 10)
        $('.webuploader-pick').text('正在上传' + name + ",进度:" + percent + "%");
    });
    uploader.on('uploadSuccess', function (file) {
        $('.webuploader-pick').text(file.name + '上传完成');
        $('#filemd5').val(file.fileMd5);
        filename = file.name;
        $('#process-bar').css('width', '100%');
        uploader.reset();
    });

    uploader.on('uploadError', function (file) {
        $('.webuploader-pick').text('上传出错');
    });
    uploader.on('error', function (type) {
        switch (type) {
            case "Q_EXCEED_NUM_LIMIT ":
                break;
            case "Q_EXCEED_SIZE_LIMIT ":
                break;
            case "Q_TYPE_DENIED":
                console.log("文件类型不符合要求")
                break;
        }
    })
    uploader.on('uploadComplete', function (file) {
    });

    if (isMobile()) {
        $('#btnTXT').html('<textarea rows="10" id="iptText" class="form-control"  placeholder="请输入内容简介"></textarea>')
    } else {
        var E = window.wangEditor
        editor = new E('#btnTXT')
        editor.customConfig.pasteFilterStyle = false
        editor.customConfig.pasteIgnoreImg = true;
        editor.customConfig.uploadImgShowBase64 = false;
        editor.customConfig.showLinkImg = true;
        editor.customConfig.uploadImgMaxSize = 2 * 1024 * 1024;
        editor.customConfig.uploadImgMaxLength = 1;
        editor.customConfig.customUploadImg = (files, insert) => {
            const formData = new FormData();
            formData.append('file', files[0]);
            $.ajax({
                type: 'post',
                url: filebase+'/upload/img',
                processData: false,
                contentType: false,
                data: formData, success: function (res) {
                    if (res.r === 200) {
                        const data = res.url;
                        insert(data);
                    }
                }
            });
        };
        editor.create()
        editor.txt.html('<p>请输入文件的介绍</p>')
    }
    $("#iptali").change(showpic);
    $("#iptwx").change(showpic);
    $("#btnSubmit").click(submit)
    $("#modpublicsuccess").delegate("#btnCopy", "click", function () {
        var copyText = $("#iptUrl");//获取对象
        copyText.select();//选择
        document.execCommand("Copy");//执行复制
        alert("复制成功！");
    })
});

