var $ = require('jquery');
var jedit = require('json-editor'); // TODO webpackify
var ko = require('knockout');

var $osf = require('js/osfHelpers');
var oop = require('js/oop');

// add for single select of check boxes
JSONEditor.defaults.resolvers.unshift(function(schema) {
    if (schema.type === "array" && schema.items && !(Array.isArray(schema.items)) && schema.uniqueItems && schema.items["enum"] && ['string', 'number', 'integer'].indexOf(schema.items.type) >= 0) {
        return "singleselect";
    }
});
JSONEditor.defaults.editors.singleselect = JSONEditor.defaults.editors.multiselect.extend({
    build: function() {

        var self = this,
            i;
        if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
        if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);

        if ((!this.schema.format && this.option_keys.length < 8) || this.schema.format === "checkbox") {
            this.input_type = 'checkboxes';

            this.inputs = {};
            this.controls = {};
            for (i = 0; i < this.option_keys.length; i++) {
                this.inputs[this.option_keys[i]] = this.theme.getCheckbox();
                this.select_options[this.option_keys[i]] = this.inputs[this.option_keys[i]];
                var label = this.theme.getCheckboxLabel(this.option_keys[i]);
                this.controls[this.option_keys[i]] = this.theme.getFormControl(label, this.inputs[this.option_keys[i]]);
            }

            this.control = this.theme.getMultiCheckboxHolder(this.controls, this.label, this.description);
        } else {
            this.input_type = 'select';
            this.input = this.theme.getSelectInput(this.option_keys);
            this.input.multiple = true;
            this.input.size = Math.min(10, this.option_keys.length);

            for (i = 0; i < this.option_keys.length; i++) {
                this.select_options[this.option_keys[i]] = this.input.children[i];
            }

            if (this.schema.readOnly || this.schema.readonly) {
                this.always_disabled = true;
                this.input.disabled = true;
            }

            this.control = this.theme.getFormControl(this.label, this.input, this.description);
        }

        this.container.appendChild(this.control);
        var previous;
        this.control.addEventListener("mouseover", function(e) {
            var new_value = [];
            for (i = 0; i < self.option_keys.length; i++) {
                if (self.select_options[self.option_keys[i]].selected || self.select_options[self.option_keys[i]].checked) {
                    new_value.push(self.select_values[self.option_keys[i]]);
                }
            }
            previous = new_value;

        });
        this.control.addEventListener('change', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // delete older one using previous
            var new_value = [];
            for (i = 0; i < self.option_keys.length; i++) {
                if (self.select_options[self.option_keys[i]].selected || self.select_options[self.option_keys[i]].checked) {

                    var str = '"' + self.select_values[self.option_keys[i]] + '"';
                    var blah = self.select_values[self.option_keys[i]];
                    if (previous.indexOf(blah) != -1) {
                        self.select_options[self.option_keys[i]].checked = false;
                    } else {
                        new_value.push(self.select_values[self.option_keys[i]]);
                    }
                }
            }
            self.updateValue(new_value);
            self.onChange(true);
        });
    }
});

var RegistrationEditor = function(urls, editorSelector) {
    var self = this;

    self.urls = urls;
    self.$editor = $(editorSelector);
    self.editor = null;

    self.defaultOptions = [{
        id: null,
        title: 'Please select a registration form to initiate registration'
    }];
    self.schemas = ko.observable(self.defaultOptions);
    self.selectedSchemaId = ko.observable(null);
    self.selectedSchemaId.subscribe(function() {       
        self.schema(
            self.schemas().filter(function(s) {
                return s.id === self.selectedSchemaId();
            })[0]
        );
        self.updateEditor(self.schema().pages[0]);
    });

    self.schema = ko.observable({});
    self.schema.subscribe(function(schema) {
        self.updateEditor(schema);
    });
    self.schemaData = ko.observable(null);

    self.disableSave = ko.pureComputed(function() {
        return !self.schema();
    });
};
RegistrationEditor.prototype.init = function() {
    var self = this;
    
    var fetchData = self.fetchData()
        .then(self.updateData.bind(self));

    var fetchSchemas = self.fetchSchemas()
        .then(self.updateSchemas.bind(self));
    
    $.when(fetchData, fetchSchemas).then(function(data) {
        self.selectedSchemaId(data.schema_id);
    });
};
RegistrationEditor.prototype.updateSchemas = function(schemas) {
    var self = this;
    self.schemas(self.defaultOptions.concat(schemas));
};
RegistrationEditor.prototype.fetchSchemas = function() {
    var self = this;
    return $.getJSON(self.urls.schemas);
};

RegistrationEditor.prototype.updateData = function(response) {
    var self = this;
    self.schemaData($.extend({}, self.schemaData() || {}, response.schema_data));
};
RegistrationEditor.prototype.fetchData = function() {
    var self = this;
    return $.getJSON(self.urls.data);
};

RegistrationEditor.prototype.updateEditor = function(page) {
    var self = this;

    if (!page) {
        return;
    }
    // load the data for the first schema and display
    if (self.editor) {
        self.editor.destroy();
    }
    self.editor = new JSONEditor(self.$editor[0], {
        schema: page,
        startVal: self.schmeaData(),
        theme: 'bootstrap3',
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        no_additional_properties: true
    });
    self.editor.on('change', function() {
        self.save();
    });
};
RegistrationEditor.prototype.selectPage = function(page) {
    var self = this;
    self.updateEditor(page);
};
RegistrationEditor.prototype.save = function() {
    var self = this;
    var schemaData = self.editor.getValue();

    return $osf.putJSON(self.urls.save, {
        schema_id: self.selectedSchemaId(),
        schema_version: self.schema().version,
        schema_data: schemaData
    }).then(function(response) {
        console.log(response);
    });
};

module.exports = RegistrationEditor;
