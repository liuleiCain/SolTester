let form, layer, xmSelectAbi;
layui.use(['form', 'layer', 'code'], function () {
    form = layui.form;
    layer = layui.layer;
});

function connectWeb3(obj) {
    if (typeof window.ethereum == 'undefined') {
        layer.alert('MetaMask not installed!');
        return false;
    }
    if (window.ethereum) {
        try {
            // 请求用户授权
            window.ethereum.enable();
        } catch (error) {
            // 用户不授权时
            console.error("User denied account access")
        }
    }
    web3js = new Web3(window.ethereum);//web3js就是你需要的web3实例
    web3js.eth.getAccounts(function (error, result) {
        if (!error) {
            $(obj).html("已连接")
            $(obj).addClass("layui-btn-disabled")
            $("#account").val(result[0])
            $("#chain").val(window.ethereum.networkVersion)
        }
    });
}

function updateAbi(obj) {
    if (!isJSON(obj.value)) {
        layer.msg("Abi内容错误")
        obj.value = ""
        document.getElementById("abiMethod").options.length = 0;
        $("#abiMethod").append("<option value=''></option>")
    } else {
        let abi = JSON.parse(obj.value)
        let readArr = []
        let writeArr = []
        for (let i in abi) {
            if (abi[i].type == 'function') {
                switch (abi[i].stateMutability) {
                    case "view":
                        readArr.push({
                            name: abi[i].name, value: i, selected: false
                        })
                        break;
                    default:
                        writeArr.push({
                            name: abi[i].name, value: i, selected: false
                        })
                }
            }
        }
        xmSelectAbi = xmSelect.render({
            el: '#abiMethod',
            toolbar: {
                show: true,
            },
            filterable: true,
            radio: true,
            style: {
                width: "100%",
            },
            height: "500px",
            data: [
                {name: '读', children: readArr},
                {name: '写', children: writeArr},
            ],
            on: function (data) {
                $("#abiInput").html("")
                let abi = JSON.parse($("#abi").val())
                if (data.arr.length > 0) {
                    let abiMethod = abi[data.arr[0].value]
                    let html = "";
                    for (let v of abiMethod.inputs) {
                        html += '<div class="layui-form-item">\n' +
                            '    <label class="layui-form-label">' + v.name + '：</label>' +
                            '    <div class="layui-input-block">\n' +
                            '      <input type="text" name="params" id="params" placeholder="' + v.type + '" autocomplete="off" class="layui-input" argType="' + v.type + '">\n' +
                            '    </div>\n' +
                            '  </div>'
                    }
                    $("#abiInput").html(html)
                }

            },
        })
    }
    form.render()
}

async function sendTx(obj) {
    try {
        let contractAddress = $("#address").val()
        if (typeof window.ethereum == 'undefined') {
            layer.alert('MetaMask is not installed!');
            return false;
        }
        if (!window.ethereum.isConnected()) {
            layer.alert('MetaMask is not connected!');
            return false;
        }
        if (contractAddress === "") {
            layer.alert('请输入合约地址');
            return false;
        }
        if (!isJSON($("#abi").val())) {
            layer.alert('Abi内容错误');
            return false;
        }
        let abiMethod = xmSelectAbi.getValue()
        console.log(abiMethod)
        if (abiMethod.length === 0) {
            layer.alert('选择执行的合约方法');
            return false;
        }
        abiMethod = abiMethod[0].value;

        let abi = JSON.parse($("#abi").val())
        let abiSingle = abi[abiMethod]
        let contract = await web3.eth.contract(abi).at(contractAddress)

        //获取参数
        let args = []
        $("#abiInput").find("input").each(function (i) {
            let argType = $(this).attr("argType");
            if (argType.indexOf("[]") !== -1) {
                args.push(JSON.parse($(this).val()))
            } else {
                args.push($(this).val())
            }
        })

        layer.load();
        if (args.length === 0) {
            contract[abiSingle.name](function (err, res) {
                if (err) {
                    $("#content").text(JSON.stringify(err, null, "\t"))
                } else {
                    $("#content").text(JSON.stringify(res, null, "\t"))
                }
                layer.closeAll('loading');
            })
        } else {
            contract[abiSingle.name](...args, function (err, res) {
                if (err) {
                    $("#content").text(JSON.stringify(err, null, "\t"))
                } else {
                    $("#content").text(JSON.stringify(res, null, "\t"))
                }
                layer.closeAll('loading');
            })
        }

    } catch (e) {
        console.log(e)
        $("#content").text(JSON.stringify(e, null, "\t"))
    }
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }

        } catch (e) {
            console.log('error：' + str + '!!!' + e);
            return false;
        }
    }
}

window.ethereum.on('accountsChanged', (accounts) => {
    if (window.ethereum.isConnected()) {
        $("#account").val(accounts[0] || "")
    }
});

window.ethereum.on('chainChanged', (chainId) => {
    if (window.ethereum.isConnected()) {
        $("#chain").val(window.ethereum.networkVersion)
    }
});