function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

$(function () {
    $('#btnGetURL').click(function () {
        if (secret === "true") {
            var modal = $('#modSecret')
            modal.modal();
        } else {
            post(id);
        }
    });
    $('#btnDownload').click(function () {
        post(id, $("#iptSecret").val());
    });

    function post(id, secret) {
        var data = {};
        id && (data.id = id);
        secret && (data.secret = secret);
        $.post("/page/get", data, function (result) {
            if (result.r == 200) {
                $('#modSecret').modal('hide');
                beginDownLoad(result.url, "文件下载")
            } else if (result.r == 301) {
                bootoast({
                    type: 'danger',
                    message: '提取码错误',
                    timeout: 2,
                    position: 'top'
                });
            } else {
                bootoast({
                    type: 'danger',
                    message: '找不到文件或已删除',
                    timeout: 2,
                    position: 'top'
                });
            }
            console.log(result);
        });
    }

    function beginDownLoad(url, name) {
        var ua = navigator.userAgent.toLowerCase(); //获取判断用的对象
        // if (ua.match(/iPhone/i)) {
        //     //是否在IOS浏览器打开
        //     // alert("IOS版本正在紧急上线中，请耐心一下下！");
        //     return;
        // }
        if (ua.match(/MicroMessenger\/[0-9]/i) || ua.match(/WeiBo\/[0-9]/i) || ua.match(/QQ\/[0-9]/i)) {
            //在微信中打开
            $(".down-guider").show();
            return;
        }
        //默认是PC端
        downloadURI(url, name);
    }
});