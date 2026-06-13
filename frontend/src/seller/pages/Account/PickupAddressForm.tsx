import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Button, Grid } from "@mui/material";
import { type UpdateDetailsFormProps } from "./BussinessDetailsForm";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { updateSeller } from "../../../Redux Toolkit/Seller/sellerSlice";

const PickupAddressForm = ({ onClose }: UpdateDetailsFormProps) => {
  const { sellers } = useAppSelector((store) => store);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      name:     "",
      address:  "",
      locality: "",
      city:     "",
      state:    "",
      pinCode:  "",
      mobile:   "",
    },
    validationSchema: Yup.object({
      name:     Yup.string().required("Name is required"),
      address:  Yup.string().required("Address is required"),
      locality: Yup.string().required("Locality is required"),
      city:     Yup.string().required("City is required"),
      state:    Yup.string().required("State is required"),
      pinCode:  Yup.string()
        .matches(/^[0-9]{6}$/, "Must be 6 digits")
        .required("Pincode is required"),
      mobile:   Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Mobile is required"),
    }),
    onSubmit: (values) => {
      dispatch(updateSeller({ pickupAddress: values }));
      onClose();
    },
  });

  useEffect(() => {
    if (sellers.profile?.pickupAddress) {
      const a = sellers.profile.pickupAddress;
      formik.setValues({
        name:     a.name     || sellers.profile.sellerName || "",
        address:  a.address  || "",
        locality: a.locality || "",
        city:     a.city     || "",
        state:    a.state    || "",
        pinCode:  a.pinCode  || "",
        mobile:   a.mobile   || sellers.profile.mobile || "",
      });
    }
  }, [sellers.profile]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth size="small" name="name" label="Contact Name"
            value={formik.values.name}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth size="small" name="address" label="Street Address"
            value={formik.values.address}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth size="small" name="locality" label="Locality / Area"
            value={formik.values.locality}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.locality && Boolean(formik.errors.locality)}
            helperText={formik.touched.locality && formik.errors.locality}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth size="small" name="city" label="City"
            value={formik.values.city}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.city && Boolean(formik.errors.city)}
            helperText={formik.touched.city && formik.errors.city}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth size="small" name="state" label="State"
            value={formik.values.state}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.state && Boolean(formik.errors.state)}
            helperText={formik.touched.state && formik.errors.state}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth size="small" name="pinCode" label="Pincode"
            value={formik.values.pinCode}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.pinCode && Boolean(formik.errors.pinCode)}
            helperText={formik.touched.pinCode && formik.errors.pinCode}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth size="small" name="mobile" label="Mobile"
            value={formik.values.mobile}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.mobile && Boolean(formik.errors.mobile)}
            helperText={formik.touched.mobile && formik.errors.mobile}
          />
        </Grid>
        <Grid size={12}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              py: 1.4,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669, #047857)",
              },
            }}
          >
            Save Address
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default PickupAddressForm;