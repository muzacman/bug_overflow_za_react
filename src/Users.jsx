//User page

import React from 'react';

const apiURL = 'http://localhost:3006';

function UserForm({ user, updateUser, formMode, submitCallback, cancelCallback}) {

    let cancelClicked = (event) => {
        event.preventDefault();
        cancelCallback();
    }

    let renderButtons = () => {
        if (formMode === "new") {
            return(
                <button type="submit" className="btn btn-primary">Create</button>
            );
        } else {
            return (
                <div className="form-group">
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="submit" className="btn btn-danger" onClick={cancelClicked} >Cancel</button>
                </div>
            );
        }

    }

    let formSubmitted = (event) => {
        //Prevent the browser from re-loading the page.
        event.preventDefault();
        submitCallback();
    };

    return (
        <div className="user-form">
            <h1> Users </h1>
            <form onSubmit={formSubmitted}>
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" className="form-control" autoComplete='given-name' name="fname" id="fname"
                           placeholder="First Name" value={user.fname} onChange={(event) => updateUser('fname', event.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="lname">Last Name</label>
                    <input type="text" className="form-control" autoComplete='family-name' name="lname" id="lname"
                           placeholder="Last Name" value={user.lname} onChange={(event) => updateUser('lname', event.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" className="form-control" autoComplete='email' name="email" id="email"
                           placeholder="name@example.com" value={user.email} onChange={(event) => updateUser('email', event.target.value)}/>
                </div>
                <div className="form-group">
                    <label htmlFor="thumbnail">Thumbnail</label>
                    <input type="text" className="form-control" name="thumbnail" id="thumbnail"
                           placeholder="myPic.jpg" value={user.thumbnail} onChange={(event) => updateUser('thumbnail', event.target.value)}/>
                </div>
                {renderButtons()}
            </form>
        </div>
    );
}

function UserListItem({ user, onEditClicked, onDeleteClicked }) {
    return (
        <tr>
            <td className="col-md-3">{user.fname}</td>
            <td className="col-md-3">{user.lname}</td>
            <td className="col-md-3">{user.email}</td>
            <td className="col-md-3">{user.thumbnail}</td>
            <td className="col-md-3 btn-toolbar">
                <button className="btn btn-success btn sm" onClick={event => onEditClicked(user)}>
                    <i className="glyphicon glyphicon-pencil"></i> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={event => onDeleteClicked(user.id)}>
                    <i className="glyphicon glyphicon-remove"></i> Delete
                </button>
            </td>
        </tr>
    )
}

function UserList({users, onEditClicked, onDeleteClicked}) {
    const userItems = users.map((user) => (
        <UserListItem key={user.id} user={user} onEditClicked={onEditClicked} onDeleteClicked={onDeleteClicked}/>
    ));

    return (
        <div className="user-list">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th className="col-md-3">First Name</th>
                        <th className="col-md-3">Last Name</th>
                        <th className="col-md-3">Email</th>
                        <th className="col-md-3">Thumbnail</th>
                        <th className="col-md-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                {userItems}
                </tbody>
            </table>
        </div>
    );
}

function Users() {
    let [userList, setUserList] = React.useState([
        {id: 1, fname: "Hasn't", lname: "Loaded Yet", email: "", thumbnail: ""}
        ]);

    let [formMode, setFormMode] = React.useState("new");

    let emptyUser = {fname: '', lname: '', email: '', thumbnail: ''};
    let [currentUser, setCurrentUser] = React.useState(emptyUser);

    let fetchUsers = () => {
        fetch(apiURL + "/users").then(response => {
            console.log("Look what I got: ");
            console.log(response);

            return response.json();
        }).then(data => {
            console.log("And the JSON");
            console.log(data);

            setUserList(data);
        });
    };

    React.useEffect(() => fetchUsers(), []);

    let updateUser = (field, value) => {
        let newUser = { ...currentUser };
        newUser[field] = value;
        setCurrentUser(newUser);
    };

    let postNewUser = (user) => {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify(user)
        };
        console.log("Attempting to post new user");
        console.log(user);
        console.log(options.body);
        // eslint-disable-next-line no-template-curly-in-string
        return fetch(apiURL + '/users', options).then(response => {
            return response.json();
        });
    };

    let formSubmitted = () => {
        if (formMode === "new") {
            postNewUser(currentUser).then(data => {
                console.log("Received data");
                console.log(data);
                if (!data.message) {
                    currentUser.id = data.id;
                    setUserList([...userList, currentUser]);
                } else {
                    console.log("New user wasn't created because" + data.message);
                }
            });
        } else {
            let newUserList = [...userList];
            let userIndex = userList.findIndex((user) => user.id === currentUser.id );

            newUserList[userIndex] = currentUser;
            setUserList(newUserList);
        }
    };

    let editClicked = (user) => {
        setFormMode("update");
        setCurrentUser(user);
    };

    let cancelClicked = () => {
        setFormMode("new");
        setCurrentUser(emptyUser);
    };

    let deleteClicked = (id) => {
        setUserList(userList.filter((item) => item.id !== id));

        cancelClicked();
    }

    return (
        <div className="users">
            <UserForm formMode={formMode} user={currentUser} updateUser={updateUser}
                      submitCallback={formSubmitted} cancelCallback={cancelClicked}/>
            <div/>
            <UserList users={userList} onEditClicked={editClicked} onDeleteClicked={deleteClicked}/>
        </div>
    );
}

export default Users;