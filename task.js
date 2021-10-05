var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.undoAbles = [];
        this.redoAbles = [];
        this.ceo = ceo;
    }
    EmployeeOrgApp.prototype.adjustTree = function (supervisor, pos) {
        var employee = supervisor.subordinates.splice(pos, 1)[0];
        var action = {
            employeeID: employee.uniqueId,
            parentID: supervisor.uniqueId,
            supervisorID: -1,
            childeIDS: []
        };
        while (employee.subordinates.length) {
            var obj = employee.subordinates.shift();
            if (obj !== undefined) {
                action.childeIDS.push(obj.uniqueId);
                supervisor.subordinates.push(obj);
            }
        }
        this.undoAbles.push(action);
        return employee;
    };
    EmployeeOrgApp.prototype.getEmployee = function (employee, employeeID) {
        for (var i = 0; i < employee.subordinates.length; i++) {
            if (employee.subordinates[i].uniqueId === employeeID) {
                return this.adjustTree(employee, i);
            }
            else if (employee.subordinates[i].subordinates.length) {
                var obj = this.getEmployee(employee.subordinates[i], employeeID);
                if (obj !== null) {
                    return obj;
                }
            }
        }
        return null;
    };
    EmployeeOrgApp.prototype.setEmployee = function (supervisor, supervisorID, employee) {
        if (supervisor.uniqueId === supervisorID) {
            supervisor.subordinates.push(employee);
            return true;
        }
        for (var i = 0; i < supervisor.subordinates.length; i++) {
            if (this.setEmployee(supervisor.subordinates[i], supervisorID, employee)) {
                return true;
            }
        }
        return false;
    };
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        if (employeeID == this.ceo.uniqueId) {
            console.log("CEO is not move able");
            return;
        }
        var employee = this.getEmployee(this.ceo, employeeID);
        if (employee === null) {
            console.log("Invalid Employee ID");
            return;
        }
        this.setEmployee(this.ceo, supervisorID, employee);
        this.undoAbles[this.undoAbles.length - 1].supervisorID = supervisorID;
        this.redoAbles = [];
    };
    EmployeeOrgApp.prototype.moveForUndo = function (parentEmployee, employee, action) {
        if (parentEmployee.uniqueId === action.parentID) {
            parentEmployee.subordinates.push(employee);
            parentEmployee.subordinates = parentEmployee.subordinates.filter(function (tempEmp) {
                if (action.childeIDS.includes(tempEmp.uniqueId)) {
                    employee.subordinates.push(tempEmp);
                    return false;
                }
                return true;
            });
            this.redoAbles.push({
                employeeID: employee.uniqueId,
                parentID: -1,
                supervisorID: action.supervisorID,
                childeIDS: []
            });
            return true;
        }
        for (var i = 0; i < parentEmployee.subordinates.length; i++) {
            if (this.moveForUndo(parentEmployee.subordinates[i], employee, action)) {
                return true;
            }
        }
        return false;
    };
    EmployeeOrgApp.prototype.undo = function () {
        var obj = this.undoAbles.pop();
        if (obj !== undefined) {
            // { employeeID: 3, parentID: 2, supervisorID: -1, childeIDS: [ 4, 5 ] }
            var employee = this.getEmployee(this.ceo, obj.employeeID);
            if (employee !== null) {
                this.moveForUndo(this.ceo, employee, obj);
            }
            // this.redoAbles.push(obj);
        }
        else {
            console.log("Nothing is undoable");
        }
    };
    EmployeeOrgApp.prototype.redo = function () {
        var obj = this.redoAbles.pop();
        if (obj !== undefined) {
            this.move(obj.employeeID, obj.supervisorID);
            // this.undoAbles.push(obj);
        }
        else {
            console.log("Nothing is redoable");
        }
    };
    EmployeeOrgApp.prototype.print = function (employees, indentation) {
        var _this = this;
        if (employees === void 0) { employees = null; }
        if (indentation === void 0) { indentation = 0; }
        if (employees == null) {
            console.log(ceo.name + "(" + ceo.uniqueId + ")");
            this.print(this.ceo.subordinates, indentation + 4);
        }
        else {
            employees.forEach(function (employee) {
                console.log("" + Array(indentation + 1).join(" ") + employee.name + "(" + employee.uniqueId + ")");
                if (employee.subordinates.length) {
                    _this.print(employee.subordinates, indentation + 4);
                }
            });
        }
    };
    return EmployeeOrgApp;
}());
var ceo = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [
        {
            uniqueId: 2,
            name: "Sarah Donald",
            subordinates: [
                {
                    uniqueId: 3,
                    name: "Cassandra Reynolds",
                    subordinates: [
                        {
                            uniqueId: 4,
                            name: "Mary Blue",
                            subordinates: []
                        },
                        {
                            uniqueId: 5,
                            name: "Bob Saget",
                            subordinates: [
                                {
                                    uniqueId: 6,
                                    name: "Tina Teff",
                                    subordinates: [
                                        { uniqueId: 7, name: "Will Turner", subordinates: [] },
                                    ]
                                },
                            ]
                        },
                    ]
                },
            ]
        },
        {
            uniqueId: 8,
            name: "Tyler Simpson",
            subordinates: [
                {
                    uniqueId: 9,
                    name: "Harry Tobs",
                    subordinates: [
                        { uniqueId: 10, name: "Thomas Brown", subordinates: [] },
                    ]
                },
                { uniqueId: 11, name: "George Carrey", subordinates: [] },
                { uniqueId: 12, name: "Gary Styles", subordinates: [] },
            ]
        },
        {
            uniqueId: 13,
            name: "Bruce Willis",
            subordinates: []
        },
        {
            uniqueId: 14,
            name: "Georgina Flangy",
            subordinates: [{ uniqueId: 15, name: "Sophie Turner", subordinates: [] }]
        },
    ]
};
/**
  Mark Zuckerberg:
      - Sarah Donald:
          - Cassandra Reynolds:
              - Mary Blue:
              - Bob Saget:
                  - Tina Teff:
                      - Will Turner:
      - Tyler Simpson:
          - Harry Tobs:
              - Thomas Brown:
          - George Carrey:
          - Gary Styles:
      - Bruce Willis:
      - Georgina Flangy:
          - Sophie Turner:
  */
var app = new EmployeeOrgApp(ceo);
app.print();
console.log("");
app.move(3, 10);
app.print();
console.log("");
app.undo();
app.print();
console.log("");
app.redo();
app.print();
console.log("");
