define([
    "text!templates/Tasks/CreateTemplate.html",
    "collections/Projects/ProjectsDdCollection",
    "collections/Customers/AccountsDdCollection",
    "collections/Tasks/TasksCollection",
    "collections/Customers/CustomersCollection",
    "collections/Workflows/WorkflowsCollection",
    "collections/Priority/TaskPriority",
    "models/TasksModel",
    "common",
    "custom"
],
    function (CreateTemplate, ProjectsDdCollection, AccountsDdCollection, TasksCollection, CustomersCollection, WorkflowsCollection, PriorityCollection, TaskModel, common, Custom) {

        var CreateView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Tasks",
            template: _.template(CreateTemplate),

            initialize: function (options) {
                this.projectsDdCollection = new ProjectsDdCollection();
                this.projectsDdCollection.bind('reset', _.bind(this.render, this));
                this.accountDdCollection = new AccountsDdCollection();
                this.accountDdCollection.bind('reset', _.bind(this.render, this));
                this.customersDdCollection = new CustomersCollection();
                this.customersDdCollection.bind('reset', _.bind(this.render, this));
                this.workflowsDdCollection = new WorkflowsCollection({ id: "task" });
                this.workflowsDdCollection.bind('reset', _.bind(this.render, this));
                this.bind('reset', _.bind(this.render, this));
                this.priorityCollection = new PriorityCollection();
                this.priorityCollection.bind('reset', _.bind(this.render, this));
                this.tasksCollection = options.collection;
                this.pId = options.pId;
                this.render();
            },

            events: {
                "click #tabList a": "switchTab",
                "click #deadline": "showDatePicker"
            },
			showDatePicker: function (e) {
				if ($(".createFormDatepicker").find(".arrow").length==0){
					$(".createFormDatepicker").append("<div class='arrow'></div>")
				}
				
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

            saveItem: function () {
                var self = this;
                var mid = 39;

                var taskModel = new TaskModel();

                var summary = $("#summary").val();

                var idProject = this.$("#projectDd option:selected").val();
                var project = common.toObject(idProject, this.projectsDdCollection);

                var idAssignedTo = this.$("#assignedTo option:selected").val();
                var assignedTo = common.toObject(idAssignedTo, this.accountDdCollection);

                var deadline = $.trim($("#deadline").val());
                //var deadline = "";
                //if (deadlineSt) {
                //    deadline = new Date(Date.parse(deadlineSt)).toISOString();
                //}

                var tags = $.trim($("#tags").val()).split(',');

                var description = $("#description").val();

                var sequence = parseInt($.trim($("#sequence").val()));

                var StartDate = $.trim($("#StartDate").val());
                //var StartDate = "";
                //if (startDateSt) {
                //    StartDate = new Date(Date.parse(startDateSt)).toISOString();
                //}

                var EndDate = $.trim($("#EndDate").val());
                //var EndDate = "";
                //if (endDateSt) {
                //    EndDate = new Date(Date.parse(endDateSt)).toISOString();
                //}

                var idCustomer = this.$("#customerDd option:selected").val();
                var customer = common.toObject(idCustomer, this.customersDdCollection);


                var idWorkflow = this.$("#workflowDd option:selected").val();
                var workflow = common.toObject(idWorkflow, this.workflowsDdCollection);

                var estimated = $("#estimated").val();

                var logged = $("#loged").val();

                var idPriority = this.$("#priority option:selected").val();
                var priority = common.toObject(idCustomer, this.customersDdCollection);

                taskModel.save({
                    summary: summary,
                    assignedTo: assignedTo,
                    workflow: workflow,
                    project: project,
                    tags: tags,
                    deadline: deadline,
                    description: description,
                    extrainfo: {
                        priority: priority,
                        sequence: sequence,
                        customer: customer,
                        StartDate: StartDate,
                        EndDate: EndDate
                    },
                    estimated: estimated,
                    logged: logged
                },
                {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function (model) {
                        model = model.toJSON();
                        if (!model.project._id) {
                            Backbone.history.navigate("home/content-" + self.contentType, { trigger: true });
                            
                        } else {
                            Backbone.history.navigate("home/content-Tasks/kanban/" + model.project._id, { trigger: true });
                        }
                    },
                    error: function (model, xhr, options) {
                        Backbone.history.navigate("home", { trigger: true });
                    }
                });
            },

            render: function () {
                this.$el.html(this.template({
                    projectsDdCollection: this.projectsDdCollection, accountDdCollection: this.accountDdCollection, customersDdCollection: this.customersDdCollection,
                    workflowsDdCollection: this.workflowsDdCollection, priorityCollection: this.priorityCollection, projectId: this.pId
                }));
                $('#deadline').datepicker({ dateFormat: "d M, yy", showOtherMonths: true, selectOtherMonths: true });
				$("#ui-datepicker-div").addClass("createFormDatepicker");
				$('#StartDate').datepicker({ dateFormat: "d M, yy" });
				$('#EndDate').datepicker({ dateFormat: "d M, yy" });
                return this;
            }

        });

        return CreateView;
    });
