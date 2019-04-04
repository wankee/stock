const model = require('./model');

let
    Pet = model.Pet;
// User = model.User;
var now = Date.now();

(async () => {
    // var user = await User.create({
    //     name: 'John',
    //     gender: false,
    //     email: 'john-' + Date.now() + '@garfield.pet',
    //     passwd: 'hahaha'
    // });
    // console.log('created: ' + JSON.stringify(user));
    var cat = await Pet.create({
        // id: 'g-' + now,
        name: 'Gaffey',
        gender: false,
        birth: '2007-07-07',
    });
    console.log('created: ' + JSON.stringify(cat));
    var dog = await Pet.create({
        // id: 'g-' + now,
        name: 'Odie',
        gender: false,
        birth: '2008-08-08',
    });
    console.log('created: ' + JSON.stringify(dog));
})();