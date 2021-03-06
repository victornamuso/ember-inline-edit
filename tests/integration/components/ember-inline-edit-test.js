import { moduleForComponent, test } from "ember-qunit"
import hbs from "htmlbars-inline-precompile"

import { fillIn, click, find, keyEvent } from "ember-native-dom-helpers"

moduleForComponent(
  "ember-inline-edit",
  "Integration | Component | ember inline edit",
  {
    integration: true,

    beforeEach: function() {
      this.on("onSave", val => {
        this.set("value", val)
      })

      this.on("onCancel", () => {
        this.set("value", "canceled")
      })

      this.set("value", null)
    }
  }
)

const classNames = {
  container: ".ember-inline-edit",
  input: ".ember-inline-edit-input",
  saveBtn: ".ember-inline-edit-save",
  cancelBtn: ".ember-inline-edit-cancel",
  hint: ".ember-inline-edit .hint",
  cancelLink: ".ember-inline-edit-cancel-link",
  cancelPrefix: ".ember-inline-edit-cancel-prefix"
}

test("it renders", function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  assert.ok(find(classNames.container))
})

test("the label is default", function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  assert.equal(find(classNames.container).innerText.trim(), "Not Provided")
})

test("on click, it shows the input and buttons", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  assert.notOk(find(classNames.input))
  assert.notOk(find(classNames.saveBtn))
  assert.notOk(find(classNames.cancelBtn))

  await click(classNames.container)

  assert.ok(find(classNames.input))
  assert.ok(find(classNames.saveBtn))
  assert.ok(find(classNames.cancelBtn))
})

test("on click, the input gets focus", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)

  assert.ok(
    document.activeElement.classList.contains("ember-inline-edit-input")
  )
})

test("it does not render the save button", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        showSaveButton=false
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.notOk(find(classNames.saveBtn))
})

test("it does not render the cancel button", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        showCancelButton=false
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.notOk(find(classNames.cancelBtn))
})

test("it renders a non-default save button label", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        saveLabel="✓"
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.equal(find(classNames.saveBtn).innerText.trim(), "✓")
})

test("it renders a non-default cancel button label", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        cancelLabel="x"
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.equal(find(classNames.cancelBtn).innerText.trim(), "x")
})

test("it renders a cancel link instead of a button", async function(assert){
  this.render(hbs`{{ember-inline-edit
                        value=value
                        cancelType='link'
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.ok(find(classNames.cancelLink))
})

test("it renders text between the save button and the cancel button", async function(assert){
  this.render(hbs`{{ember-inline-edit
                        value=value
                        cancelType='link'
			cancelPrefix="foo"
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  assert.ok(find(classNames.cancelPrefix))
  assert.ok(find(classNames.cancelPrefix).innerText.trim(),"foo")
})

test("on click, it renders the hint if present", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        hintLabel="press Enter to save"
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  assert.notOk(find(classNames.hint))
  await click(classNames.container)

  assert.ok(find(classNames.hint))
  assert.ok(find(classNames.hint).innerText.trim(), "press Enter to save")
})

test("on save, it sends the save action", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  await fillIn(classNames.input, "Something")
  await click(classNames.saveBtn)

  assert.equal(this.get("value"), "Something")
})

test("on pressing enter in text field, it sends the save action", async function(
  assert
) {
  this.render(hbs`{{ember-inline-edit
                        value=(readonly value)
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  await fillIn(classNames.input, "Something Else")
  await keyEvent(classNames.input, "keyup", 13)

  assert.equal(this.get("value"), "Something Else")
  assert.notOk(find(classNames.input))
})

test("on pressing enter in textarea field, it does not send the save action", async function(
  assert
) {
  this.render(hbs`{{ember-inline-edit
                    value=value
                    field="textarea"
                    onSave="onSave"
                    onCancel="onCancel"}}`)

  await click(classNames.container)
  await fillIn(classNames.input, "Something")
  await keyEvent(classNames.input, "keyup", 13)

  assert.ok(find(classNames.input))
})

test("on cancel, it sends the cancel action and restores the input field to initial state", async function(
  assert
) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  await click(classNames.container)
  await fillIn(classNames.input, "Some initial value")
  await click(classNames.saveBtn)

  await click(classNames.container)
  await fillIn(classNames.input, "Some new value")
  await click(classNames.cancelBtn)

  assert.equal(this.get("value"), "Some initial value")
})

test("on pressing esc, it sends the close action", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                        value=value
                        onSave="onSave"
                        onCancel="onCancel"}}`)

  assert.notOk(find(classNames.input))

  await click(classNames.container)
  assert.ok(find(classNames.input))

  this.$(".ember-inline-edit-input").trigger("esc")
  await keyEvent(classNames.input, "keyup", 27)

  assert.notOk(find(classNames.input))
})

test("the text field is the same width as the original element", async function(
  assert
) {
  this.render(hbs`{{ember-inline-edit
                      value='A long field value, probably at least a few hundred pixels'
                      onSave="onSave"
                      onCancel="onCancel"}}`)

  assert.notOk(find(classNames.input))

  let { width } = find(classNames.container).getBoundingClientRect()
  await click(classNames.container)

  let inputWidth = find(classNames.input).style.width
  assert.equal(inputWidth, `${width + 2}px`)
})

test("on click, it does nothing if not enabled", async function(assert) {
  this.render(hbs`{{ember-inline-edit
                    enabled=false}}`)

  assert.notOk(find(classNames.input))
  await click(classNames.container)
  assert.notOk(find(classNames.input))
})

test("it should send the close action if disabled", async function(assert) {
  this.set("enabled", true)

  this.render(hbs`{{ember-inline-edit
                    enabled=enabled
                    value=value}}`)

  await click(classNames.container)
  assert.ok(find(classNames.input))

  this.set("enabled", false)

  assert.notOk(find(classNames.input))
  assert.equal(this.get("value", "closed"))
})

test("it should gain the .disabled class if not enabled", function(assert) {
  this.set("enabled", true)

  this.render(hbs`{{ember-inline-edit
                    enabled=enabled
                    value=value}}`)

  assert.ok(find(".ember-inline-edit:not(.disabled)"))

  this.set("enabled", false)
  assert.ok(find(".ember-inline-edit.disabled"))
})

test("it should render the editable inside block if a block is present", function(
  assert
) {
  this.render(hbs`{{#ember-inline-edit as |inline-edit|}}
                    {{#inline-edit.editable}}
                      Test
                    {{/inline-edit.editable}}
                  {{/ember-inline-edit}}`)

  assert.equal(find(classNames.container).innerText.trim(), "Test")
})

test("it should render the editor inside block if a block is present", function(
  assert
) {
  this.render(hbs`{{#ember-inline-edit as |inline-edit|}}
                    {{#inline-edit.editor class="editor"}}
                      Test
                    {{/inline-edit.editor}}
                  {{/ember-inline-edit}}`)

  const text = find(".editor").innerText.trim()

  assert.ok(/Test/.test(text), "renders the custom component")
  assert.ok(/Save/.test(text), "renders the save button")
})

test("it should toggle the custom editor when clicked on the editable", async function(
  assert
) {
  this.render(hbs`{{#ember-inline-edit as |inline-edit|}}
                    {{#inline-edit.editable class="editable"}}
                      Editable
                    {{/inline-edit.editable}}

                    {{#inline-edit.editor class="editor"}}
                      Editor
                    {{/inline-edit.editor}}
                  {{/ember-inline-edit}}`)

  assert.ok(
    find(".editor").classList.contains("is-hidden"),
    "editor is hidden by default"
  )
  assert.ok(
    find(".editable").classList.contains("is-visible"),
    "editable is visible by default"
  )

  await click(".editor")

  assert.ok(
    find(".editor").classList.contains("is-visible"),
    "editor is visible after click"
  )
  assert.ok(
    find(".editable").classList.contains("is-hidden"),
    "editable is hidden after click"
  )
})
