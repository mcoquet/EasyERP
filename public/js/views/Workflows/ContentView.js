define([
    'text!templates/Workflows/list/ListTemplate.html',
    'views/Workflows/list/ListItemView',
    'text!templates/Workflows/form/FormTemplate.html',
    'collections/RelatedStatuses/RelatedStatusesCollection',
    'views/Workflows/CreateView',
    'custom',
    "models/WorkflowsModel",
    "common"
],
function (ListTemplate, ListItemView, FormTemplate, RelatedStatusesCollection, CreateView, Custom, WorkflowsModel, common) {
    var ContentView = Backbone.View.extend({
        el: '#content-holder',
        initialize: function (options) {
			this.startTime = options.startTime;
            _.bindAll(this, "saveStatus", "render");
            this.relatedStatusesCollection = new RelatedStatusesCollection();
            this.relatedStatusesCollection.bind('reset', _.bind(this.render, this));
            console.log('Init Workflows View');
            this.collection = options.collection;
            this.collection.bind('reset', _.bind(this.render, this));
            this.render();
        },

        events: {
            "click .checkbox": "checked",
            //"click td:not(:has('input[type='checkbox']'))": "gotoForm",
            "click a.workflow": "chooseWorkflowNames",
            "click .workflow-sub": "chooseWorkflowDetailes",
            "click .workflow-list li": "chooseWorkflowNames",
            "click #workflowNames div.cathegory a": "chooseWorkflowDetailes",
            "click #workflowSubNames div.cathegory a": "chooseWorkflowDetailes",
            "click #workflowNames span": "chooseWorkflowDetailes",
            "click td .edit": "edit",
            "click td .delete": "deleteItems",
            "click #addNewStatus": "addNewStatus",
            "click a.cancel": "cancel",
            "click a.save": "save",
            "click #saveStatus": "saveStatus",
            "click #cancelStatus": "cancelStatus",
            "click .editAll": "editAll",
            "click .deleteAll": "deleteAll",
            "click .saveAll": "saveAll",
            "click .cancelAll": "cancelAll",
            "mouseenter .workflow-sub-list li:not(.quickEdit)":"quickEdit",
            "mouseleave .workflow-sub-list li": "removeEdit",
        },

        save: function (e) {
            e.preventDefault();
            var mid = 39;
            $("#addNewStatus").show();
            var tr = $(e.target).closest("tr");
            var name = tr.find("td.name input").val();
            var status = tr.find("td.status option:selected").text();
            var tdName = tr.find("td.name");
            var id = tdName.data("id");
            var sequence = tdName.data("sequence");
            var model = this.collection.get(id);
            this.collection.url = "/Workflows";
            var obj = {
                name: name,
                status: status,
                sequence: sequence
            };

            model.set(obj, {validate : true});
            model.save({}, {
                headers: {
                    mid: mid
                },
                success: function (model) {
                    common.checkBackboneFragment("easyErp/Workflows");
                }
            });
        },

        cancel: function (e) {
            e.preventDefault();
            var targetParent = $(e.target).parent();
            targetParent.siblings().find("span").removeClass("hidden").end().find("input, select, a:contains('Cancel'), a:contains('Save')").remove();
            targetParent.find(".edit").removeClass("hidden").end().find("a:contains('Cancel'), a:contains('Save')").remove();
            targetParent.find(".delete").removeClass("hidden").end().find("a:contains('Cancel'), a:contains('Save')").remove();
            $("#addNewStatus").show();
        },

        edit: function (e) {
            e.preventDefault();
            var targetParent = $(e.target).parent();
            $("span").removeClass("hidden");
            $(".addnew, .SaveCancel").remove();
            $(".name input, input.nameStatus, select, a:contains('Cancel'), a:contains('Save')").remove();
            $(".edit").removeClass("hidden");
            $(".delete").removeClass("hidden");
            $("#addNewStatus").show();
            var target = $(e.target);
            var td = target.parent();
            var text = "<a href='#'>";
            var select = $("<select/>");
            target.closest("tr").find("span, .edit").addClass("hidden");
            target.closest("tr").find("span, .delete").addClass("hidden");
            td.siblings(".status").append(select);
            var statusText = td.siblings("td.status").text();
            this.relatedStatusesCollection.forEach(function (status) {
                var statusJson = status.toJSON();
                (statusJson.status == statusText) ?
                    select.append($("<option>").text(statusJson.status).attr('selected', 'selected')) :
                    select.append($("<option>").text(statusJson.status));
            });

            td.siblings(".name").append(
                $("<input>").val(td.siblings("td.name").text()));
            td.append(
                $(text).text("Save").addClass("save"),
                $(text).text("Cancel").addClass("cancel")
            );
        },

        deleteItems: function (e) {
            var mid = 39;
            e.preventDefault();
            var tr = $(e.target).closest("tr");
            var name = tr.find("td.name input").val();
            var status = tr.find("td.status option:selected").text();
            var tdName = tr.find("td.name");
            var id = tdName.data("id");
            var sequence = tdName.data("sequence");
            var model = this.collection.get(id);
            this.collection.url = "/Workflows";
            var self = this;
            var answer = confirm("Realy DELETE items ?!");
            if (answer == true) {
                model.destroy({
                    headers: {
                        mid: mid
                    },
                    success: function () {
                    	common.checkBackboneFragment("easyErp/Workflows", { trigger: true });
                    },
                    error: function () {
                        Backbone.history.navigate("easyErp", { trigger: true });
                    }
                });
            }
        },

        gotoForm: function (e) {
            App.ownContentType = true;
            var itemIndex = $(e.target).closest("tr").data("index") + 1;
            window.location.hash = "#home/content-Workflows/form/" + itemIndex;
        },

        chooseSubWorkflowNames: function (e) {
            alert($(e.target).hasClass("workflow-sub"));

        },
        chooseWorkflowNames: function (e) {
            e.preventDefault();
            this.$(".workflow-sub-list>*").remove();
            this.$("#details").addClass("active").show();
            this.$("#workflows").empty();
            this.$("#workflowNames").html("");
            $("#addNewStatus").hide();
            $(e.target).parents(".workflow-list").find(".active").removeClass("active");
            var wId = "";
            if ($(e.target).hasClass("workflow")) {
                $(e.target).parent().addClass("active");
                wId = $(e.target).text();
            } else {
                $(e.target).addClass("active");
                wId = $(e.target).find("a").text();

            }
            var names = [], wName;

            _.each(this.collection.models, function (model) {
                if (model.get('wId') == wId && wName != model.get('wName')) {
                    names.push(model.get('wName'));
                    wName = model.get('wId');

                }
            }, this);

            var first = false;
            var workflowsWname = _.uniq(names);
            _.each(workflowsWname, function (name) {
                if (first) {
                    this.$(".workflow-sub-list").append("<li class='active'><a class='workflow-sub' id='" + wName + "' data-id='" + name + "'href='javascript:;'>" + name + "</a></li>");
                    first = false;
                }
                else {
                    this.$(".workflow-sub-list").append("<li id='" + name + "' data-id='" + name + "'><a class='workflow-sub' id='" + wName + "' data-id='" + name + "' href='javascript:;'>" + name + "</a></li>");
                }
            }, this);
        },
        chooseWorkflowDetailes: function (e) {

            $(e.target).parents(".workflow-sub-list").find(".active").removeClass("active");
            $("#addNewStatus").show();
            if ($(e.target).hasClass("workflow-sub")) {
                $(e.target).parent().addClass("active");
            } else {
                $(e.target).addClass("active");
            }
            //this.$("#sub-details").html("");
            var name = $(e.target).data("id");
            var nameDetails = this.$("#sub-details").attr("data-id");
            if (name == nameDetails && this.$("#sub-details").hasClass("active")) {
                this.$("#details").hide(150, function () {
                    $(this).removeClass("active");
                })
                return;
            }
            else {
                this.$("#details").show(150, function () {
                    $(this).addClass("active");
                })
            }
            var values = [];
            _.each(this.collection.models, function (model) {
                if (model.get('wName') == name) {
                    values.push({ id: model.get("_id"), name: model.get('name'), status: model.get('status'), sequence: model.get('sequence'), color: model.get('color') });
                }
            }, this);
            this.$("#sub-details").attr("data-id", name).find("#workflows").empty().append($("<thead />").append(
               $("<tr />").append($("<th />").text("Name"), $("<th />").text("Status"), $("<th />"))), $("<tbody/>"));
            _.each(values, function (value) {
                this.$("#sub-details tbody").append(new ListItemView({ model: value }).render().el);
            }, this);
        },

        render: function () {
            Custom.setCurrentCL(this.collection.models.length);
            console.log('Render Workflows View');
            var workflowsWIds = _.uniq(_.pluck(this.collection.toJSON(), 'wId'), false);
            var workflowsWname = _.uniq(_.pluck(this.collection.toJSON(), 'wName'), false);
            this.$el.html(_.template(ListTemplate, { workflowsWIds: workflowsWIds }));
			this.$el.append("<div id='timeRecivingDataFromServer'>Created in "+(new Date()-this.startTime)+" ms</div>");
            return this;
        },

        checked: function () {
            if ($("input:checked").length > 0)
                $("#top-bar-deleteBtn").show();
            else
                $("#top-bar-deleteBtn").hide();
        },
        createItem: function () {
            new CreateView({ collection: this.collection });
        },

        editItem: function () {
            //create editView in dialog here
            new EditView({ collection: this.collection });
        },

        addNewStatus: function (e) {
            $("span").removeClass("hidden");
            $(".name input, select, a:contains('Cancel'), a:contains('Save')").remove();
            $(".edit").removeClass("hidden");
            $(".delete").removeClass("hidden");
            e.preventDefault();
            var mid = 39;
            e.preventDefault();
            $("#addNewStatus").hide();
            $("#workflows").append("<tr class='addnew'><td><input type='text' class='nameStatus' maxlength='32' required /></td><td><select id='statusesDd'></select></td></tr><tr class='SaveCancel'><td><input type='button' value='Save' id='saveStatus' /><input type='button' value='Cancel' id='cancelStatus' /></td></tr>");
            var targetParent = $(e.target).parent();
            var target = $(e.target);
            var td = target.parent();
            var text = "<a href='#'>";
            this.relatedStatusesCollection.forEach(function (status) {
                var statusJson = status.toJSON();
                $("#statusesDd").append($("<option>").text(statusJson.status));
            });

        },
        cancelStatus: function (e) {
            e.preventDefault();
            $(".addnew, .SaveCancel").remove();
            $("#addNewStatus").show();
        },

        saveStatus: function (e) {
            e.preventDefault();
            var mid = 39;
            var workflowsModel = new WorkflowsModel();
            var wId = $(".workflow-list li.active").text();
            var name = $(".workflow-sub-list li.active a").text();

            var value = [];
            var names = [],
                statuses = [];
            names.push($.trim($(".nameStatus").val()));
            statuses.push($("#statusesDd option:selected").val());
            for (var i = 0; i < names.length; i++) {
                value.push({ name: names[i], status: statuses[i], sequence: i });
            }
            workflowsModel.save({
                wId: wId,
                name: name,
                value: value
            },
            {
                headers: {
                    mid: mid
                },
                wait: true,
                success: function (model) {
                    common.checkBackboneFragment("easyErp/Workflows");
                    $(".addnew, .SaveCancel").remove();
                    $("span").removeClass("hidden");
                    $("input, select, a:contains('Cancel'), a:contains('Save')").remove();
                    $(".edit").removeClass("hidden");
                    $(".delete").removeClass("hidden");
                },
                error: function () {
                    Backbone.history.navigate("easyErp", { trigger: true });
                }
            });
        },
        cancelAll:function(e) {
            e.preventDefault();
            $(".save-status").remove();
            $(".wNameEdit").remove();
            $("li").find("a.workflow-sub").show();
            $(".quickEdit").removeClass();
        },
        editAll: function(e){
            e.preventDefault();
            $(".save-status").remove();
            $(".wNameEdit").remove();
            $("li").find("a.workflow-sub").show();
            $(".quickEdit").removeClass();
            var targetInput = $(e.target).parent();
           // targetInput.closest("li").find("span, .edit").hide();
            var text = targetInput.closest("li").find("a.workflow-sub").text();
            targetInput.closest("li").find("a.workflow-sub").hide();
            targetInput.closest("li").addClass("quickEdit")
            targetInput.closest("li").find("span").hide();
            targetInput.closest("li").append(
                    $("<input class='wNameEdit' type='text' value = '"+text+"' required />")
            );
            targetInput.closest("li").append("<span class='save-status'><a href='#' class='saveAll'>Save</a> <a href='#' class='cancelAll'>Cancel</a></span>");
            
        },
        
        quickEdit:function(e){

        	$(".workflow-sub-list li#" + e.target.id).append("<span class='edit-holder'><a href='#' class='editAll'>Edit</a>&nbsp;<a href='#' class='deleteAll'>Delete</a></span>");
        },
        removeEdit:function(){
        	$(".edit-holder").remove();
        },
        
        deleteAll: function(e){
            e.preventDefault();
            var wId = $(e.target).parent().attr("id");
            var mid = 39;
            var targetInput = $(e.target).parent();
            var wName = targetInput.closest("li").find("a.workflow-sub").text();
            var answer = confirm("Realy DELETE items ?!");
            if (answer == true) {
            	this.collection.url = "/Workflows";
            	_.each(this.collection.models, function (model) {
                    if ((model.get('wName')) == wName){
                            model.destroy({
                                headers: {
                                    mid: mid
                                },
                                success: function () {
                                	common.checkBackboneFragment("easyErp/Workflows", { trigger: true });
                                },
                                error: function () {
                                    Backbone.history.navigate("easyErp", { trigger: true });
                                }
                            });
                        
                    }
            }, this);
            }
        },
        
        saveAll:function(e, options){  	
        	e.preventDefault();
            var mid = 39;
            var targetInput = $(e.target).parent();
            var wName = targetInput.closest("li").find("a.workflow-sub").text();
            this.collection.url = "/Workflows";
            _.each(this.collection.models, function (model) {
            		if ((model.get('wName')) == wName){
                    	var new_wname = $(".wNameEdit").val();
                    	if(new_wname != "") {
	                    	model.set('wName', new_wname, {validate : true});
	                    	model.save({},{
	                             headers: {
	                                 mid: mid
	                             },
	                             success: function (model) {
	                                 common.checkBackboneFragment("easyErp/Workflows");
	                             }
	                        });
	                    }else {
	                    	alert("field can not be empty");
	                    }
                    }
            }, this);
        }
    });

    return ContentView;
});
