"use strict";

describe("support", function () {
  it("should exist", function () {
      expect(oak).toBeDefined();
  });

  describe("getProp", function () {

    it("should be defined", function () {
        expect(oak.support.getProp).toBeDefined();
    });

    it ("should return vendor prefixed property", function () {
      expect(oak.support.getProp("animation")).toBe("-webkit-animation");
      expect(oak.support.getProp("transition")).toBe("-webkit-transition");
    });

  });


});
