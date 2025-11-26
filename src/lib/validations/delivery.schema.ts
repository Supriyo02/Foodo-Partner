import * as yup from "yup";

export const slotSchema = yup.object({
  mealType: yup.string().oneOf(["Breakfast", "Lunch", "Dinner", "Snacks", "Custom"]).required(),
  startDate: yup.date().required("Start time required"),
  endDate: yup
    .date()
    .required("End time required")
    .test("after-start", "End must be after start", function (val) {
      const { startDate } = this.parent;
      if (!startDate || !val) return true;
      return val > startDate;
    }),
  cutoffDate: yup
    .date()
    .required("Cutoff time required")
    .test("before-start", "Cutoff must be before start", function (val) {
      const { startDate } = this.parent;
      if (!startDate || !val) return true;
      return val < startDate;
    }),
});