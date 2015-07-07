app.directive("navigation", function () {
    return {
        restrict: "A",
        templateUrl: "views/navigationSection.html",
        controller: function () {
            this.page = 1;

            this.isSet = function (checkPage) {
                return this.page === checkPage;
            };

            this.setPage = function (activePage) {
                this.page = activePage;
            };
        },
        controllerAs: "navigation"
    };
});