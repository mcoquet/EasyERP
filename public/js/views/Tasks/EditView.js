﻿define([
    "text!templates/Tasks/EditTemplate.html",
    "common"
],
    function (EditTemplate, common) {

        var EditView = Backbone.View.extend({
            contentType: "Tasks",
            template: _.template(EditTemplate),
            initialize: function (options) {
                _.bindAll(this, "render", "saveItem");
                _.bindAll(this, "render", "deleteItem");
                this.currentModel = (options.model) ? options.model : options.collection.getElement();
                this.render();
            },

            events: {
                "click #tabList a": "switchTab",
                "click .breadcrumb a, #Cancel span, #Done span": "changeWorkflow",
                "change #workflowDd": "changeWorkflowValues",
                'keydown': 'keydownHandler',
                "click .current-selected": "showNewSelect",
                "click .newSelectList li:not(.miniStylePagination)": "chooseOption",
                "click .newSelectList li.miniStylePagination": "notHide",
                "click .newSelectList li.miniStylePagination .next:not(.disabled)": "nextSelect",
                "click .newSelectList li.miniStylePagination .prev:not(.disabled)": "prevSelect",
                "click": "hideNewSelect",
				"click #projectTopName":"hideDialog"
            },

            keydownHandler: function(e){
                switch (e.which){
                    case 27:
                        this.hideDialog();
                        break;
                    default:
                        break;
                }
            },

            hideDialog: function () {
                $(".edit-dialog").remove();
            },

            changeWorkflow: function (e) {
                var mid = 39;
                var model = {};
                var name = '', status = '';
                if ($(e.target).hasClass("applicationWorkflowLabel")) {
                    var breadcrumb = $(e.target).closest('li');
                    var a = breadcrumb.siblings().find("a");
                    if (a.hasClass("active")) {
                        a.removeClass("active");
                    }
                    breadcrumb.find("a").addClass("active");
                    name = breadcrumb.data("name");
                    status = breadcrumb.data("status");
                } else {
                    var workflow = {};
                    var length = this.workflowsDdCollection.models.length;
                    if ($(e.target).closest("button").attr("id") == "Cancel") {
                        workflow = this.workflowsDdCollection.models[length - 1];
                    }
                    else {
                        workflow = this.workflowsDdCollection.models[length - 2];
                    }
                    name = workflow.get('name');
                    status = workflow.get('status');
                }
                model = this.collection.get($(e.target).closest(".formHeader").siblings().find("form").data("id"));
                var ob = {
                    workflow: {
                        name: name,
                        status: status
                    }
                };

                model.set(ob);
                model.save({}, {
                    headers: {
                        mid: mid
                    }
                });

            },

            switchTab: function (e) {
                e.preventDefault();
                var link = this.$("#tabList a");
                if (link.hasClass("selected")) {
                    link.removeClass("selected");
                }
                var index = link.index($(e.target).addClass("selected"));
                this.$(".tab").hide().eq(index).show();
            },

            saveItem: function (event) {
                event.preventDefault();
                var self = this;

                var mid = 39;
                var summary = $.trim(this.$el.find("#summary").val());
                var project = $("#projectDd option:selected").val();
                var assignedTo = $("#assignedToDd option:selected").val();

                var tags = $.trim($("#tags").val()).split(',');
                if (tags.length == 0) {
                    tags = null;
                }

                var sequence = $.trim(this.$el.find("#sequence").val());
                if (!sequence) {
                    sequence = null;
                }
                var workflow = $("#workflowsDd option:selected").val();
                var estimated = $.trim(this.$el.find("#estimated").val());
                if ($.trim(estimated) == "") {
                    estimated = 0;
                }

                var logged = $.trim(this.$el.find("#logged").val());

                var priority = $("#priorityDd option:selected").val();

                var data = {
                    type: $("#type option:selected").text(),
                    summary: summary,
                    assignedTo: assignedTo ? assignedTo : null,
                    workflow: workflow ? workflow : null,
                    project: project,
                    tags: tags,
                    deadline: $.trim(this.$el.find("#deadline").val()),
                    description: $.trim(this.$el.find("#description").val()),
                    extrainfo: {
                        priority: priority,
                        sequence: sequence,
                        StartDate: $.trim(this.$el.find("#StartDate").val())
                    },
                    estimated: estimated,
                    logged: logged
                };


                this.currentModel.save(data, {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function (model) {
                        model = model.toJSON();
                        self.hideDialog();
                        if (!model.project) {
                            Backbone.history.navigate("easyErp/Tasks/kanban", { trigger: true });

                        } else {
                            Backbone.history.navigate("easyErp/Tasks", { trigger: true });
                        }
                    },
                    error: function (model, xhr, options) {
                        Backbone.history.navigate("easyErp", { trigger: true });
                    }
                });

            },

            changeWorkflowValues: function () {
                this.$("#workflowValue").html("");
                var that = this;
                var choosedWorkflow = _.filter(that.workflows, function (workflow) {
                    return workflow.wId == that.$("#workflowDd option:selected").val();
                });
                console.log(this.currentModel.get('workflow')._id);
                _.each(choosedWorkflow, function (value,key) {
                     this.currentModel.get('workflow')._id === value._id ?
                     this.$("#workflowValue").append( $('<option/>').val(value._id).text(value.name + " (" + value.status + ")" ).attr('selected', 'selected')):
                     this.$("#workflowValue").append( $('<option/>').val(value._id).text(value.name + " (" + value.status + ")" ));
                },this);
            },

            notHide: function (e) {
				return false;
            },

			nextSelect:function(e){
				this.showNewSelect(e,false,true)
			},
			prevSelect:function(e){
				this.showNewSelect(e,true,false)
			},
            showNewSelect:function(e,prev,next){
				var elementVisible = 25;
				var newSel = $(e.target).parent().find(".newSelectList")
				if (prev||next){
					newSel = $(e.target).closest(".newSelectList")
				}
				var parent = newSel.length>0?newSel.parent():$(e.target).parent();
                var currentPage = 1;
                if (newSel.is(":visible")&&!prev&&!next){
                    newSel.hide();
					return;
				}

                if (newSel.length){
                    currentPage = newSel.data("page");
                    newSel.remove();
                }
				if (prev)currentPage--;
				if (next)currentPage++;
                var s="<ul class='newSelectList' data-page='"+currentPage+"'>";
                var start = (currentPage-1)*elementVisible;
				var options = parent.find("select option");
                var end = Math.min(currentPage*elementVisible,options.length);
                for (var i = start; i<end;i++){
                    s+="<li class="+$(options[i]).text().toLowerCase()+">"+$(options[i]).text()+"</li>";                                                
                }
				var allPages  = Math.ceil(options.length/elementVisible)
                if (options.length>elementVisible)
                    s+="<li class='miniStylePagination'><a class='prev"+ (currentPage==1?" disabled":"")+"' href='javascript:;'>&lt;Prev</a><span class='counter'>"+(start+1)+"-"+end+" of "+parent.find("select option").length+"</span><a class='next"+ (currentPage==allPages?" disabled":"")+"' href='javascript:;'>Next&gt;</a></li>";
                s+="</ul>";
                parent.append(s);
                return false;
                
            },

			styleSelect:function(id){
				var text = $(id).find("option:selected").length==0?$(id).find("option").eq(0).text():$(id).find("option:selected").text();
				$(id).parent().append("<a class='current-selected' href='javascript:;'>"+text+"</a>");
				$(id).hide();
			},
            deleteItem: function(event) {
                var mid = 39;
                event.preventDefault();
                var self = this;
                    var answer = confirm("Realy DELETE items ?!");
                    if (answer == true) {
                        this.currentModel.destroy({
                            headers: {
                                mid: mid
                            },
                            success: function () {
                                $('.edit-dialog').remove();
                                Backbone.history.navigate("easyErp/" + self.contentType, { trigger: true });
                            },
                            error: function () {
                                $('.edit-dialog').remove();
                                Backbone.history.navigate("home", { trigger: true });
                            }
                        });
                }
            },
            render: function () {
                var formString = this.template({
                    model: this.currentModel.toJSON()
                });
                var self = this;
                this.$el = $(formString).dialog({
                    dialogClass: "edit-dialog",
                    width: 600,
                    title: this.currentModel.toJSON().project.projectShortDesc,
                    buttons:{
                        save:{
                            text: "Save",
                            class: "btn",
                            click: self.saveItem
                        },
                        cancel:{
                            text: "Cancel",
                            class: "btn",
                            click: self.hideDialog
                        },
                        delete:{
                            text: "Delete",
                            class: "btn",
                            click: self.deleteItem
                        }
                    }
                });
                common.populateProjectsDd(App.ID.projectDd, "/getProjectsForDd", this.currentModel.toJSON(),function(){self.styleSelect(App.ID.projectDd);});
                common.populateWorkflows("Tasks", App.ID.workflowDd, App.ID.workflowNamesDd, "/WorkflowsForDd", this.currentModel.toJSON(),function(){self.styleSelect(App.ID.workflowDd);self.styleSelect(App.ID.workflowNamesDd);});
                common.populateEmployeesDd(App.ID.assignedToDd, "/getPersonsForDd", this.currentModel.toJSON(),function(){self.styleSelect(App.ID.assignedToDd);});
                common.populatePriority(App.ID.priorityDd, "/Priority", this.currentModel.toJSON(), function(){self.styleSelect(App.ID.priorityDd);});
				this.styleSelect("#type");
                this.delegateEvents(this.events);
                $('#StartDate').datepicker({ dateFormat: "d M, yy", minDate: new Date() });
                $('#deadline').datepicker({
                    dateFormat: "d M, yy",
                    changeMonth: true,
                    changeYear: true,
                    minDate: new Date()
                });
                $("#ui-datepicker-div").addClass("createFormDatepicker");
                return this;
            }

        });
        return EditView;
    });
