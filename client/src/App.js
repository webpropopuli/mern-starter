import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    // initialize our state
    this.state = {
      data: [], // array of all items
      id: 0,
      message: "",
      updMessage: "",
      idToDelete: "",
      idToUpdate: ""
    };
  }
  // when component mounts, first thing it does is fetch all existing data in our db
  componentDidMount() {
    this.getDataFromDb(0);
  }

  // Cleanup. If we set it above, now unset it
  componentWillUnmount() {}

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object _id assigned by MongoDB to modify
  // data base entries

  //# Read DB: api/getData is handled in our Express code on the server
  getDataFromDb = (mode = 1) => {
    console.log("CLI->GET", mode); // mode = is timer based; 1 is on demand
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => {
        this.setState({ data: res.data });
      })
      .finally(() => this.setState({ idToDelete: "", idToUpdate: "" }));
  };

  //# Write to DB. Generates lowest available id slot for new item.
  addDataToDB = () => {
    console.log("CLI->PUT");
    let currentIds = this.state.data.map(data => data.id);
    let nextFreeIdSlot = 0;
    while (currentIds.includes(nextFreeIdSlot)) {
      ++nextFreeIdSlot;
    }

    axios
      .post("http://localhost:3001/api/putData", {
        id: nextFreeIdSlot,
        message: this.state.message
      })
      .then(() => this.getDataFromDb())

      .catch(e => console.log("PUT error: ", e))
      .finally(() => this.setState({ message: "" }));
  };

  //# Delete from DB
  deleteFromDB = () => {
    console.log("CLI->DEL");

    this.state.data.forEach(dat => {
      //console.log(`(${this.state.idToDelete}) >> ${dat}`);
      if (dat.id == this.state.idToDelete) {
        axios
          .delete("http://localhost:3001/api/deleteData", {
            data: {
              id: dat._id
            }
          })
          .then(() => this.getDataFromDb())
          .catch(err => console.log("DEL error:", err));
      }
      this.setState({ idToDelete: "" });
    });
  };

  //# Update single item in DB
  updateDB = () => {
    //console.log(`CLI->UPDATE: id=${this.state.idToUpdate} update=${this.state.updMessage}`);
    let objIdToUpdate = null;

    /* Yes, yes, I know. "A for loop? A FREAKIN FOR LOOP? Whassup noob?"
       Well, 'whassup' is that there's no point in looping through all the items after we get a match and, for whatever reason, you can't terminate a forEach loop or a map().
       (Google that if you don't believe me.)

       I could have done filter(dat.id == id) and then made the update on the resulting array, but that makes me feel overly tricky and why would I want to introduce an array for 1 item?

       And I suppose that array.some() is another option but I'm writing a MERN app not a
       javascript torture-chamber.

       There's always more than one way...
       In five years, we'll all look back on this code and laugh. Maybe sooner.
*/
    for (let x = 0; x < this.state.data.length; x++) {
      const dat = this.state.data[x];
      if (dat.id == this.state.idToUpdate) {
        objIdToUpdate = dat._id;
        axios
          .post("http://localhost:3001/api/updateData", {
            id: objIdToUpdate,
            update: { message: this.state.updMessage }
          })
          .then(() => this.getDataFromDb())
          .catch(err => console.log("UPDATE error:", err))
          .finally(() => this.setState({ idToUpdate: "", updMessage: "" }));
        break;
      }
    }
  };

  // This is how we retrieve the input val via function
  updateDelete = event => {
    this.setState({ idToDelete: event.target.value });
  };

  //#FRONT END follows
  render() {
    const inputStyle = { lineHeight: "1.5em", width: "200px" };
    const { data } = this.state;
    return (
      <div style={{ backgroundColor: "#555", color: "#eee" }}>
        <ul>
          {data.length <= 0
            ? "DB is empty"
            : data.map(dat => (
                <li style={{ padding: "5px" }} key={dat.id}>
                  <span style={{ color: "gray" }}> id: </span> {dat.id} &nbsp;
                  <span style={{ color: "gray" }}> data: </span>
                  {dat.message}
                </li>
              ))}
        </ul>
        <div style={{ padding: "4px" }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="add something in the database"
            onChange={e => this.setState({ message: e.target.value })}
            value={this.state.message}
          />
          <button onClick={this.addDataToDB}>ADD</button>
        </div>
        <div style={{ padding: "4px" }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="put id of item to delete here"
            onChange={this.updateDelete}
            value={this.state.idToDelete}
          />
          <button onClick={this.deleteFromDB}>DELETE</button>
        </div>
        <div style={{ padding: "6px" }}>
          <input
            type="text"
            style={inputStyle}
            placeholder="id of item to update here"
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            value={this.state.idToUpdate}
          />
          <input
            type="text"
            style={inputStyle}
            placeholder="put new value of the item here"
            onChange={e => this.setState({ updMessage: e.target.value })}
            value={this.state.updMessage}
          />
          <button onClick={this.updateDB}>UPDATE</button>
        </div>
      </div>
    );
  }
}

export default App;
