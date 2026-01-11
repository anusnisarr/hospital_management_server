/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('db_clinic_managment');

const _id = ObjectId("69339dcce9b153e9ba2f2baa");
const updated = {
    status:"holdA",
    priority:"123AS"
};

db.getCollection('patientvisits').findOneAndUpdate(
  { _id: _id },                // filter
  { $set: { ...updated }}, // update
  { returnNewDocument: true }  // return updated doc
);