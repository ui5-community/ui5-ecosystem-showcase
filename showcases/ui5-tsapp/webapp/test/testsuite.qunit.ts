/* eslint-disable */
// @ts-nocheck
window.suite = function () {
	const suite = new parent.jsUnitTestSuite();
	const sContextPath = location.pathname.match(/(.*\/)(?:[^/]+)/)?.[1];
	suite.addTestPage(sContextPath + "unit/unitTests.qunit.html");
	suite.addTestPage(sContextPath + "integration/opaTests.qunit.html");
	return suite;
};
