
    let blockEls = window.document.createElement("DIV")
    blockEls.innerHTML = '<hr/><textarea id="textarea" placeholder="//Your code will appear here.  Copy it from here and paste it." style="width:500px;height:50px;margin-left:20%;"></textarea>\
    <div id="blocklyDiv" style="height: 600px; width: 800px; margin-left:20%;"></div>\
\
    <xml id="toolbox" style="display: none">\
        <block type="controls_if"></block>\
        <block type="controls_repeat_ext"></block>\
        <block type="logic_compare"></block>\
        <block type="math_number"></block>\
        <block type="math_arithmetic"></block>\
        <block type="text"></block>\
        <block type="text_print"></block>\
        <block type="logic_boolean"></block>\
        <block type="msg"></block>\
        <block type="return"></block>\
        <block type="variables_get"></block>\
        <block type="variables_set"></block>\
    </xml>'

    let el = window.document.getElementsByTagName('body')[0]
    el.insertBefore(blockEls, el.childNodes[0])
    el.insertBefore(window.document.getElementById('App'), blockEls)


    const Blockly = require('../node_modules/blockly/node')

    // Define msg block ( https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#kdfkh6 )
    Blockly.Blocks['msg'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("msg");
        this.appendValueInput("s")
            .setCheck(["String", "jsobject"])
            .appendField("s");
        this.appendValueInput("params")
            .setCheck("jsobject")
            .appendField("params (opt)");
        this.appendValueInput("cssClass")
            .setCheck(["String", "jsobject"])
            .appendField("cssClass (opt)");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    this.setTooltip("Accepts a string (plus optional options arg).  Prints a string in the game.");
    this.setHelpUrl("https://github.com/ThePix/QuestJS/wiki/Printing-Text#the-msg-functions");
    }
    };


    // Create msg block stub
    Blockly.JavaScript['msg'] = function(block) {
    var value_s = Blockly.JavaScript.valueToCode(block, 's', Blockly.JavaScript.ORDER_ATOMIC);
    var value_params = Blockly.JavaScript.valueToCode(block, 'params', Blockly.JavaScript.ORDER_ATOMIC);
    var value_cssclass = Blockly.JavaScript.valueToCode(block, 'cssClass', Blockly.JavaScript.ORDER_ATOMIC);
    // Assemble JavaScript into code.
    var code = ''
    if (value_s) {
        code += 'msg(' + value_s
    } else {
        return code
    }
    code += value_params ?  ', ' + value_params : ', null'
    code += value_cssclass ? ', ' + value_cssclass : ''
    code += ');\n'
    return code
    };

    // Create 'return' block
    Blockly.Blocks['return'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("return");
        this.appendValueInput("s")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(20);
    this.setTooltip("Returns the value.");
    this.setHelpUrl("");
    }
    };

    // Create 'return' block stub
    Blockly.JavaScript['return'] = function(block) {
    var value_s = Blockly.JavaScript.valueToCode(block, 's', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'return ' + value_s + ';\n';
    return code;
    };

    // Add blocks to page
    let workspace = Blockly.inject('blocklyDiv',
    {toolbox: window.document.getElementById('toolbox')});

    // Function to update the textarea target to output the code rendered
    function myUpdateFunction(event) {
    let code = Blockly.JavaScript.workspaceToCode(workspace);
    getEl('textarea').value = code;
    }

    // Add listener to the Blockly workspace
    workspace.addChangeListener(myUpdateFunction);

    // // Setup custom prompt and alert for Blockly (prompt will not work in an Electron app).
    // let  CustomDialog = {};

    // /** Override Blockly.alert() with custom implementation. */
    // Blockly.alert = function(message, callback) {
    // console.log('Alert: ' + message);
    // CustomDialog.show('Alert', message, {
    //     onCancel: callback
    // });
    // };

    // /** Override Blockly.confirm() with custom implementation. */
    // Blockly.confirm = function(message, callback) {
    // console.log('Confirm: ' + message);
    // CustomDialog.show('Confirm', message, {
    //     showOkay: true,
    //     onOkay: function() {
    //     callback(true);
    //     },
    //     showCancel: true,
    //     onCancel: function() {
    //     callback(false);
    //     }
    // });
    // };

    // /** Override Blockly.prompt() with custom implementation. */
    // Blockly.prompt = function(message, defaultValue, callback) {
    // console.log('Prompt: ' + message);
    // CustomDialog.show('Prompt', message, {
    //     showInput: true,
    //     showOkay: true,
    //     onOkay: function() {
    //     callback(CustomDialog.inputField.value);
    //     },
    //     showCancel: true,
    //     onCancel: function() {
    //     callback(null);
    //     }
    // });
    // CustomDialog.inputField.value = defaultValue;
    // };

    // /** Hides any currently visible dialog. */
    // CustomDialog.hide = function() {
    // if (CustomDialog.backdropDiv_) {
    //     CustomDialog.backdropDiv_.style.display = 'none';
    //     CustomDialog.dialogDiv_.style.display = 'none';
    // }
    // };

    // /**
    //  * Shows the dialog.
    //  * Allowed options:
    //  *  - showOkay: Whether to show the OK button.
    //  *  - showCancel: Whether to show the Cancel button.
    //  *  - showInput: Whether to show the text input field.
    //  *  - onOkay: Callback to handle the okay button.
    //  *  - onCancel: Callback to handle the cancel button and backdrop clicks.
    //  */
    // CustomDialog.show = function(title, message, options) {
    // var backdropDiv = CustomDialog.backdropDiv_;
    // var dialogDiv = CustomDialog.dialogDiv_;
    // if (!dialogDiv) {
    //     // Generate HTML
    //     backdropDiv = window.document.createElement('div');
    //     backdropDiv.id = 'customDialogBackdrop';
    //     backdropDiv.style.cssText =
    //         'position: absolute;' +
    //         'top: 0; left: 0; right: 0; bottom: 0;' +
    //         'background-color: rgba(0, 0, 0, .7);' +
    //         'z-index: 100;';
    //         window.document.body.appendChild(backdropDiv);

    //     dialogDiv = window.document.createElement('div');
    //     dialogDiv.id = 'customDialog';
    //     dialogDiv.style.cssText =
    //         'background-color: #fff;' +
    //         'width: 400px;' +
    //         'margin: 20px auto 0;' +
    //         'padding: 10px;';
    //     backdropDiv.appendChild(dialogDiv);

    //     dialogDiv.onclick = function(event) {
    //     event.stopPropagation();
    //     };

    //     CustomDialog.backdropDiv_ = backdropDiv;
    //     CustomDialog.dialogDiv_ = dialogDiv;
    // }
    // backdropDiv.style.display = 'block';
    // dialogDiv.style.display = 'block';

    // dialogDiv.innerHTML =
    //     '<header class="customDialogTitle"></header>' +
    //     '<p class="customDialogMessage"></p>' +
    //     (options.showInput ? '<div><input id="customDialogInput"></div>' : '') +
    //     '<div class="customDialogButtons">' +
    //     (options.showCancel ? '<button id="customDialogCancel">Cancel</button>': '') +
    //     (options.showOkay ? '<button id="customDialogOkay">OK</button>': '') +
    //     '</div>';
    // dialogDiv.getElementsByClassName('customDialogTitle')[0]
    //     .appendChild(window.document.createTextNode(title));
    // dialogDiv.getElementsByClassName('customDialogMessage')[0]
    //     .appendChild(window.document.createTextNode(message));

    // var onOkay = function(event) {
    //     CustomDialog.hide();
    //     options.onOkay && options.onOkay();
    //     event && event.stopPropagation();
    // };
    // var onCancel = function(event) {
    //     CustomDialog.hide();
    //     options.onCancel && options.onCancel();
    //     event && event.stopPropagation();
    // };

    // var dialogInput = window.document.getElementById('customDialogInput');
    // CustomDialog.inputField = dialogInput;
    // if (dialogInput) {
    //     dialogInput.focus();

    //     dialogInput.onkeyup = function(event) {
    //     if (event.keyCode == 13) {
    //         // Process as OK when user hits enter.
    //         onOkay();
    //         return false;
    //     } else if (event.keyCode == 27)  {
    //         // Process as cancel when user hits esc.
    //         onCancel();
    //         return false;
    //     }
    //     };
    // } else {
    //     var okay = window.document.getElementById('customDialogOkay');
    //     okay && okay.focus();
    // }

    // if (options.showOkay) {
    //     window.document.getElementById('customDialogOkay')
    //         .addEventListener('click', onOkay);
    // }
    // if (options.showCancel) {
    //     window.document.getElementById('customDialogCancel')
    //         .addEventListener('click', onCancel);
    // }

    // backdropDiv.onclick = onCancel;
    // };
    

    function getEl(el){
        return window.document.getElementById(el)
    }
    const { remote } = require('electron')
    remote.Menu.getApplicationMenu().items[2].submenu.items[10].visible = true
