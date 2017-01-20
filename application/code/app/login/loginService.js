/**
 * Copyright (c) 2015 SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
 * ALL RIGHTS RESERVED.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Neither the name of the SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * This work has been performed in the framework of the SONATA project,
 * funded by the European Commission under Grant number 671517 through 
 * the Horizon 2020 and 5G-PPP programmes. The authors would like to 
 * acknowledge the contributions of their colleagues of the SONATA 
 * partner consortium (www.sonata-nfv.eu).* dirPagination - AngularJS module for paginating (almost) anything.
 */


(function () {
    'use strict';

    angular
        .module('Login')
        .factory('AuthenticationService', AuthenticationService);

    AuthenticationService.$inject = ['$http', '$localStorage', 'ENV'];
    function AuthenticationService($http, $localStorage, $rootScope) {
        var service = {};        

        service.Login = Login;
        service.Logout = Logout;

        return service;

        function Login(username, password, ENV, callback) {

            if (ENV.userManagementEnabled == 'false') {                
                
                var fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6InNvbmF0YSIsImFkbWluIjp0cnVlfQ.AdgPchW4kBolbrVPn8YlrNIOx8XqcHcO_bCR2gclGyo';

                $localStorage.currentUser = { username: 'sonata', token: fakeToken };
                $http.defaults.headers.common.Authorization = fakeToken;
                callback(true);
            } else {
                //console.log("http://"+ENV.apiEndpoint+"/authenticate params {username: "+username+", password: "+password+"}");
                var data = {"username": username, "password": password};
                $http.post(ENV.apiEndpoint+'/authenticate', data)
                .then(function successCallback(response){
                
                    // login successful if there's a token in the response                
                    if (response.data.token) {
                    
                        // store username and token in local storage to keep user logged in between page refreshes                    
                        $localStorage.currentUser = { username: username, token: response.data.token };
                    
                        // add jwt token to auth header for all requests made by the $http service
                        //$http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                        $http.defaults.headers.common.Authorization = response.data.token;

                        // execute callback with true to indicate successful login                    
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login                    
                        callback(false);
                    }})
                .catch(function errorCallback(error){
                    callback(false);
                });
            }            
        }

        function Logout() {  
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            delete $rootScope.username;  
            delete $rootScope.nSDs;
            delete $rootScope.nSRs;
            delete $rootScope.Requests;          
            $http.defaults.headers.common.Authorization = '';          
        }
    }
})();