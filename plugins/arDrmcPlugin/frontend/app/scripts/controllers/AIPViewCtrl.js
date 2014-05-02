'use strict';

module.exports = function ($scope, $modal, SETTINGS, $stateParams, AIPService, InformationObjectService, ModalDigitalObjectViewerService, ModalDownloadService, ModalReclassifyAipService, AuthenticationService) {

  AIPService.getAIP($stateParams.uuid)
    .success(function (data) {
      $scope.aip = data;
      pullFiles();
    });

  // Levels of description to determine part_of link
  $scope.artworkId = parseInt(SETTINGS.drmc.lod_artwork_record_id);
  $scope.techId = parseInt(SETTINGS.drmc.lod_supporting_technology_record_id);

  $scope.openReclassifyModal = function () {
    ModalReclassifyAipService.open($scope.aip.uuid, $scope.aip.part_of.title).result.then(function (data) {
      $scope.aip.type.id = data.type_id;
      $scope.aip.type.name = data.type;
    });
  };


  /**
   * Interaction with modals
   */

  $scope.downloadFile = function (file) {
    ModalDownloadService.downloadFile($scope.aip.name, $scope.aip.uuid, file.original_relative_path_within_aip);
  };

  $scope.downloadAip = function () {
    ModalDownloadService.downloadAip($scope.aip.name, $scope.aip.uuid);
  };

  $scope.openViewer = function (file) {
    ModalDigitalObjectViewerService.open(file);
  };


  /**
   * File list widget
   */

  $scope.criteria = {};
  $scope.criteria.limit = 10;
  $scope.criteria.sort = 'name';
  $scope.page = 1;
  $scope.files = [];

  var pullFiles = function () {
    InformationObjectService.getDigitalObjects($scope.aip.part_of.id, false, $scope.criteria)
      .success(function (data) {
        $scope.files = data.results;
        $scope.$broadcast('pull.success', data.total);
      });
  };

  // Get current user details/privileges
  var getCurrentUser = function () {
    return AuthenticationService.user;
  };

  $scope.$watch(getCurrentUser, function (user) {
    if (typeof user !== 'undefined') {
      $scope.user = user;
    } else {
      delete $scope.user;
    }
  });

  // Watch for criteria changes
  $scope.$watch('criteria', function () {
    if (!$scope.files.length) {
      return;
    }
    pullFiles();
  }, true);

  // Changes in scope.page updates criteria.skip
  $scope.$watch('page', function (value) {
    $scope.criteria.skip = (value - 1) * $scope.criteria.limit;
  });

};