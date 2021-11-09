function updateAbi(abi) {
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
        clickClose: true,
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
    form.render()
}

async function sendTx(abi) {
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

        let abiMethod = xmSelectAbi.getValue()
        if (abiMethod.length === 0) {
            layer.alert('选择执行的合约方法');
            return false;
        }
        abiMethod = abiMethod[0].value;

        let abiSingle = abi.abi[abiMethod]
        let contract = await web3.eth.contract(abi.abi).at(contractAddress)

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
                    res = transferJson(res)
                    $("#content").text(JSON.stringify(res, null, "\t"))
                }
                layer.closeAll('loading');
            })
        } else {
            contract[abiSingle.name](...args, function (err, res) {
                if (err) {
                    $("#content").text(JSON.stringify(err, null, "\t"))
                } else {
                    res = transferJson(res)
                    $("#content").text(JSON.stringify(res, null, "\t"))
                }
                layer.closeAll('loading');
            })
        }

    } catch (e) {
        console.log(e)
        layer.closeAll('loading');
        $("#content").text(JSON.stringify(e, null, "\t"))
    }
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            let obj = JSON.parse(str);
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

function transferJson(data) {
    try {
        data = JSON.stringify(data)
        data = JSON.parse(data)

        if (typeof data === 'string') {
            data = data.toString()
        } else if (typeof data === 'object') {
            for (let i in data) {
                data[i] = data[i].toString()
            }
        }
        return data
    } catch (e) {
        return data
    }
}
