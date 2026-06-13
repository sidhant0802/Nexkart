import { createTheme } from "@mui/material";

const customeTheme = createTheme({
  palette: {
    primary: {
      main: "#6C63FF",
      light: "#a89fff",
      dark: "#4a43cc",
    },
    secondary: {
      main: "#FF6584",
      light: "#ff99b0",
      dark: "#cc3d5a",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #6C63FF, #FF6584)",
          color: "white",
          "&:hover": {
            background: "linear-gradient(135deg, #5a52cc, #cc3d5a)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
  },
});

export default customeTheme;