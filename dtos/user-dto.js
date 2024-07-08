module.exports = class UserDto {
    name;
    surname;
    class;
    id;
    status;

    constructor(model) {
        this.name = model.name;
        this.surname = model.surname;
        this.class = model.class;
        this.id = model._id;
        this.status = model.status;
    }

    async removeName() {
        return this.name;
    }

    async removeSurname() {
        return this.surname;
    }

    async removeClass() {
        return this.class;
    }

    async removeStatus() {
        return this.status;
    }

    async removeId() {
        return this.id;
    }
}