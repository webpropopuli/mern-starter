import React, { Component } from "react";
import axios from "axios";

class App extends Component {
  // initialize our state
  state = {
    data: [],
    id: 0,
    message: null,
    intervalIsSet: false,
    idToDelete: null,
    idToUpdate: null,
    objectToUpdate: null
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 10000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // Cleanup. We set it above, now unset it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // just a note, here, in the front end, we use the id key of our data object
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify
  // data base entries

  //# Read DB: api/getData is handled in our Express code on the server
  getDataFromDb = () => {
    //console.log("CLI->GET");
    fetch("http://localhost:3001/api/getData")
      .then(data => data.json())
      .then(res => this.setState({ data: res.data }));
  };

  //# Write to DB
  putDataToDB = message => {
    console.log("CLI->PUT");
    let currentIds = this.state.data.map(data => data.id);
    let idToBeAdded = 0;
    while (currentIds.includes(idToBeAdded)) {
      ++idToBeAdded;
    }

    axios.post("http://localhost:3001/api/putData", {
      id: idToBeAdded,
      message: message
    });
  };

  //# Delete from DB
  deleteFromDB = idTodelete => {
    console.log("CLI->DEL");
    let objIdToDelete = null;
    this.state.data.forEach(dat => {
      if (dat.id === idTodelete) {
        objIdToDelete = dat._id;
      }
    });

    axios.delete("http://localhost:3001/api/deleteData", {
      data: {
        id: objIdToDelete
      }
    });
  };

  //# Update single item in DB
  // TBD filter() might be better
  updateDB = (id, theText) => {
    //console.log(`CLI->UPDATE: id=${id} update=${theText}`);
    let objIdToUpdate = null;

    /* Yes, yes, I know. "A for loop? A FREAKIN FOR LOOP? Whassup noob?"
       Well, 'whassup' is that there's no point in looping through all the items after we get a match and, for whatever reason, you can't terminate a forEach loop or a map().
       (Google that if you don't believe me.)

       I could have done filter(dat.id == id) and then made the update on the resulting array,
       but that makes me feel overly tricky and why would I want to introdue and array for 1 item?

       And I suppose array.some() is another option but I'm writing a MERN app not a
       javascript torture-chamber.

       There's always more than one way...
       In five years, we'll all look back on this code and laugh.
*/
    for (let x = 0; x < this.state.data.length; x++) {
      const dat = this.state.data[x];
      console.log("in loop");
      if (dat.id == id) {
        console.log(`CLI HIT: id=${id}(${dat._id})`);
        objIdToUpdate = dat._id;
        axios.post("http://localhost:3001/api/updateData", {
          id: objIdToUpdate,
          update: { message: theText }
        });
        break;
      }
    }

    // this.state.data.forEach(dat => {
    //   if (dat.id == id) {
    //     console.log(`CLI HIT: id=${id}(${dat._id})`);
    //     objIdToUpdate = dat._id;
    //     axios.post("http://localhost:3001/api/updateData", {
    //       id: objIdToUpdate,
    //       update: { message: theText }
    //     });
    //   }
    // });
  };

  // here is our UI
  // it is easy to understand their functions when you
  // see them render into our screen

  render() {
    const inputStyle = { lineHeight: "1.5em", width: "200px" };
    const { data } = this.state;
    return (
      <div style={{ backgroundColor: "#555", color: "#eee" }}>
        <ul>
          {data.length <= 0
            ? "NO DB ENTRIES YET"
            : data.map(dat => (
                <li style={{ padding: "6px" }} key={dat.id}>
                  <span style={{ color: "gray" }}> id: </span> {dat.id} &nbsp;
                  <span style={{ color: "gray" }}> data: </span>
                  {dat.message}
                </li>
              ))}
        </ul>
        <div style={{ padding: "6px" }}>
          <input
            type="text"
            onChange={e => this.setState({ message: e.target.value })}
            placeholder="add something in the database"
            style={inputStyle}
          />
          <button onClick={() => this.putDataToDB(this.state.message)}>ADD</button>
        </div>
        <div style={{ padding: "6px" }}>
          <input
            type="text"
            style={inputStyle}
            onChange={e => this.setState({ idToDelete: e.target.value })}
            placeholder="put id of item to delete here"
          />
          <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>DELETE</button>
        </div>
        <div style={{ padding: "6px" }}>
          <input
            type="text"
            style={inputStyle}
            onChange={e => this.setState({ idToUpdate: e.target.value })}
            placeholder="id of item to update here"
          />
          <input
            type="text"
            style={inputStyle}
            onChange={e => this.setState({ updateToApply: e.target.value })}
            placeholder="put new value of the item here"
          />
          <button onClick={() => this.updateDB(this.state.idToUpdate, this.state.updateToApply)}>UPDATE</button>
        </div>
      </div>
    );
  }
}

export default App;
