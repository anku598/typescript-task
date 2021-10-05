interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}
interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

interface Action {
  employeeID: number;
  parentID: number;
  supervisorID: number;
  childeIDS: number[];
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  undoAbles: Action[] = [];
  redoAbles: Action[] = [];
  constructor(ceo: Employee) {
    this.ceo = ceo;
  }

  adjustTree(supervisor: Employee, pos: number, addOnUndo = true): Employee {
    const employee = supervisor.subordinates.splice(pos, 1)[0];
    const action: Action = {
      employeeID: employee.uniqueId,
      parentID: supervisor.uniqueId,
      supervisorID: -1,
      childeIDS: [],
    };

    while (employee.subordinates.length) {
      const obj = employee.subordinates.shift();
      if (obj !== undefined) {
        action.childeIDS.push(obj.uniqueId);
        supervisor.subordinates.push(obj);
      }
    }
    if (addOnUndo === true) {
      this.undoAbles.push(action);
    }
    return employee;
  }

  getEmployee(
    employee: Employee,
    employeeID: number,
    addOnUndo = true
  ): null | Employee {
    for (let i = 0; i < employee.subordinates.length; i++) {
      if (employee.subordinates[i].uniqueId === employeeID) {
        return this.adjustTree(employee, i, addOnUndo);
      } else if (employee.subordinates[i].subordinates.length) {
        const obj = this.getEmployee(
          employee.subordinates[i],
          employeeID,
          addOnUndo
        );
        if (obj !== null) {
          return obj;
        }
      }
    }
    return null;
  }
  setEmployee(
    supervisor: Employee,
    supervisorID: number,
    employee: Employee
  ): boolean {
    if (supervisor.uniqueId === supervisorID) {
      supervisor.subordinates.push(employee);
      return true;
    }
    for (let i = 0; i < supervisor.subordinates.length; i++) {
      if (
        this.setEmployee(supervisor.subordinates[i], supervisorID, employee)
      ) {
        return true;
      }
    }
    return false;
  }
  move(employeeID: number, supervisorID: number): void {
    if (employeeID == this.ceo.uniqueId) {
      console.log("CEO is not move able");
      return;
    }
    const employee: null | Employee = this.getEmployee(this.ceo, employeeID);
    if (employee === null) {
      console.log("Invalid Employee ID");
      return;
    }
    this.setEmployee(this.ceo, supervisorID, employee);
    if (this.undoAbles.length) {
      this.undoAbles[this.undoAbles.length - 1].supervisorID = supervisorID;
    }
    this.redoAbles = [];
  }
  moveForUndo(
    parentEmployee: Employee,
    employee: Employee,
    action: Action
  ): boolean {
    if (parentEmployee.uniqueId === action.parentID) {
      parentEmployee.subordinates.push(employee);
      parentEmployee.subordinates = parentEmployee.subordinates.filter(
        (tempEmp: Employee) => {
          if (action.childeIDS.includes(tempEmp.uniqueId)) {
            employee.subordinates.push(tempEmp);
            return false;
          }
          return true;
        }
      );
      this.redoAbles.push({
        employeeID: employee.uniqueId,
        parentID: -1,
        supervisorID: action.supervisorID,
        childeIDS: [],
      });
      return true;
    }
    for (let i = 0; i < parentEmployee.subordinates.length; i++) {
      if (this.moveForUndo(parentEmployee.subordinates[i], employee, action)) {
        return true;
      }
    }
    return false;
  }
  undo(): void {
    const obj = this.undoAbles.pop();
    if (obj !== undefined) {
      // { employeeID: 3, parentID: 2, supervisorID: -1, childeIDS: [ 4, 5 ] }
      const employee = this.getEmployee(this.ceo, obj.employeeID, false);
      if (employee !== null) {
        this.moveForUndo(this.ceo, employee, obj);
      }
    } else {
      console.log("Nothing is undoable");
    }
  }
  redo(): void {
    const obj = this.redoAbles.pop();
    if (obj !== undefined) {
      this.move(obj.employeeID, obj.supervisorID);
    } else {
      console.log("Nothing is redoable");
    }
  }

  print(employees: null | Employee[] = null, indentation = 0): void {
    if (employees == null) {
      console.log(`${ceo.name}(${ceo.uniqueId})`);
      this.print(this.ceo.subordinates, indentation + 4);
    } else {
      employees.forEach((employee) => {
        console.log(
          `${Array(indentation + 1).join(" ")}${employee.name}(${
            employee.uniqueId
          })`
        );
        if (employee.subordinates.length) {
          this.print(employee.subordinates, indentation + 4);
        }
      });
    }
  }
}

const ceo: Employee = {
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
              subordinates: [],
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
                  ],
                },
              ],
            },
          ],
        },
      ],
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
          ],
        },
        { uniqueId: 11, name: "George Carrey", subordinates: [] },
        { uniqueId: 12, name: "Gary Styles", subordinates: [] },
      ],
    },
    {
      uniqueId: 13,
      name: "Bruce Willis",
      subordinates: [],
    },
    {
      uniqueId: 14,
      name: "Georgina Flangy",
      subordinates: [{ uniqueId: 15, name: "Sophie Turner", subordinates: [] }],
    },
  ],
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

const app = new EmployeeOrgApp(ceo);

app.print();
console.log("");

app.move(3, 10);
// console.log(app.undoAbles, "\n", app.redoAbles);
app.print();
console.log("");

app.undo();
// console.log(app.undoAbles, "\n", app.redoAbles);
app.print();
console.log("");

app.redo();
// console.log(app.undoAbles, "\n", app.redoAbles);
app.print();
console.log("");

app.undo();
// console.log(app.undoAbles, "\n", app.redoAbles);
app.print();
console.log("");
