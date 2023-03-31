<%inherit file="base.mako"/>
<%def name="title()">${_("Wiki Edit Test")}</%def>

<%def name="stylesheets()">
    ${parent.stylesheets()}
    <link rel="stylesheet" href="/static/css/pages/wiki-page.css">
</%def>
## Use full page width

<%def name="content()">
<form>
  <textarea rows="4" cols="50"></textarea>
</form>
</%def>

<%def name="javascript_bottom()">
<script>

  window.contextVars = window.contextVars || {};
    window.contextVars.wiki = {

        urls: {
            sharejs: "localhost:7007"
        },
    };
    

</script>
<script src=${"/static/public/js/sharedb-dist/sharedb.min.js"}></script>
<script src=${"/static/public/js/sharedb-dist/ot-text.min.js"}></script>
<script src="https://unpkg.com/sharedb-ace@latest/dist/sharedb-ace.min.js"></script>
<script src=${"/static/public/js/wiki-edit-page.js" | webpack_asset}></script>
<script src=${"/static/js/pages/wiki-edit-test.js" | webpack_asset}></script>
</%def>
