"use client"

import {
  Container,
  Box,
  Typography,
  Grid,
  Stack,
} from "@mui/material"
import { FaFacebook } from "react-icons/fa6"
import { IoLogoYoutube, IoLogoWhatsapp } from "react-icons/io"
import { AiFillInstagram } from "react-icons/ai"
import LinkedInIcon from "@mui/icons-material/LinkedIn"

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://f2fintech.com").replace(/\/$/, "")

const getWebUrl = (path: string) => {
  if (path.startsWith("http")) return path
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function Footer() {
  return (
    <Container
      id="footer"
      maxWidth={false}
      sx={{
        background: "#3244e6",
        textDecoration: "none",
        padding: "20px",
        position: "relative",
        zIndex: 1100,
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 6 }, py: 4 }}>
        <Grid
          container
          spacing={4}
          justifyContent="space-between"
          sx={{ textAlign: { xs: "center", sm: "left" } }}
        >
          {/* Column 1: Brand & Address */}
          <Grid item xs={12} sm="auto">
            <Typography
              sx={{
                marginBottom: "1rem",
                fontSize: "2rem",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontWeight: 650,
              }}
            >
              <a
                href={getWebUrl("/")}
                style={{ color: "#fff", textDecoration: "none" }}
              >
                F2 Fintech
              </a>
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                lineHeight: "1.5rem",
                fontSize: ".9rem",
                fontFamily: "var(--font-poppins), Poppins, sans-serif",
              }}
            >
              Office 201, Second floor, C-127,<br /> AGS Park, C Block, Sector 63,<br /> Noida, Uttar Pradesh 201301
              <br />+91 8810600135 , +91 8860600555
            </Typography>
          </Grid>

          {/* Column 2: Company */}
          <Grid item xs={6} sm="auto" sx={{ textAlign: "left" }}>
            <Typography
              sx={{
                fontWeight: 650,
                color: "#fff",
                marginBottom: ".5rem",
                fontSize: { xs: "1.15rem", sm: "1.3rem" },
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
            >
              Company
            </Typography>
            <Box>
              {[
                { text: "About us", href: "/about-us" },
                { text: "Blogs", href: "/blogs" },
                { text: "Brochures", href: "/brochures" },
                { text: "FAQ", href: "/faq" },
                { text: "Careers", href: "/careers" },
                { text: "Contact Us", href: "/contact-us" },
              ].map((item, index) => (
                <Typography key={index} sx={{ lineHeight: "2rem", fontSize: "1rem" }}>
                  <a
                    href={getWebUrl(item.href)}
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: ".9rem",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  >
                    {item.text}
                  </a>
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 3: Legal & Policy */}
          <Grid item xs={6} sm="auto" sx={{ textAlign: "left" }}>
            <Typography
              sx={{
                fontWeight: 650,
                color: "#fff",
                marginBottom: ".5rem",
                fontSize: { xs: "1.15rem", sm: "1.3rem" },
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
            >
              Legal &amp; Policy
            </Typography>
            <Box>
              {[
                { text: "Compliance", href: "/compliance" },
                { text: "Fair Practices Code", href: "/fair-practices-code" },
                { text: "Grievance Policy", href: "/grievance-policy" },
                { text: "Privacy Policy", href: "/privacy-policy" },
                { text: "Terms and Condition", href: "/terms-and-condition" },
                { text: "Cookie Settings", href: "/cookie-settings" },
              ].map((item, index) => (
                <Typography key={index} sx={{ lineHeight: "2rem", fontSize: "1rem" }}>
                  <a
                    href={getWebUrl(item.href)}
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: ".9rem",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  >
                    {item.text}
                  </a>
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 4: Products */}
          <Grid item xs={12} sm="auto" sx={{ textAlign: "left" }}>
            <Typography
              sx={{
                fontWeight: 650,
                color: "#fff",
                marginBottom: ".5rem",
                fontSize: { xs: "1.15rem", sm: "1.3rem" },
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
            >
              Products
            </Typography>
            <Box>
              {[
                { text: "Doctor Loan", href: "/doctor-loan" },
                { text: "Home Loan", href: "/home-loan" },
                { text: "Business Loan", href: "/business-loan" },
                { text: "Personal Loan", href: "/personal-loan" },
                { text: "Loan Against Property", href: "/loan-against-property" },
                { text: "Doctors and Professionals", href: "/doctors-and-professionals" },
                { text: "Download Cibil Report", href: "/download-cibil" },
                { text: "Eligibility Checker", href: "https://finwise-eligibility.netlify.app/" },
                { text: "DSA Partner", href: "/dsa" },
                { text: "Realtor Partner", href: "/realtor" },
              ].map((product, index) => (
                <Typography key={index} sx={{ lineHeight: "2rem", fontSize: "1rem" }}>
                  <a
                    href={getWebUrl(product.href)}
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: ".9rem",
                      fontFamily: "var(--font-poppins), Poppins, sans-serif",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  >
                    {product.text}
                  </a>
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 5: D&B QR Badge + Let's Connect */}
          <Grid
            item
            xs={6}
            sm="auto"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <Box
              component="a"
              href="https://dunsregistered.dnb.com/DunsRegisteredProfileAnywhere.aspx?Key1=3201911&PaArea=Email"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                position: "relative",
                width: { xs: "135px", sm: "160px" },
                marginBottom: "1.5rem",
                display: "block",
                mx: 0,
                transition: "transform 0.3s ease",
                cursor: "pointer",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box
                component="img"
                src="/QRlogo-123.webp"
                alt="D&B Registered"
                loading="lazy"
                sx={{
                  width: "100%",
                  display: "block",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: "10%",
                  left: "8%",
                  width: "84%",
                  height: "28%",
                  backgroundColor: "#004a77",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  pointerEvents: "none",
                  animation: "blink-click-here 2s infinite ease-in-out",
                  "@keyframes blink-click-here": {
                    "0%, 45%": { opacity: 0 },
                    "50%, 100%": { opacity: 1 },
                  },
                }}
              >
                Click Here
              </Box>
            </Box>

            <Typography
              sx={{
                fontWeight: 650,
                color: "#fff",
                marginBottom: ".5rem",
                fontSize: { xs: "1.15rem", sm: "1.3rem" },
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              }}
            >
              Let&apos;s Connect
            </Typography>

            <Stack
              direction="row"
              justifyContent="flex-start"
              flexWrap="wrap"
              gap={1.5}
              sx={{ mt: 1, color: "white" }}
            >
              <a href="https://www.facebook.com/f2fintech/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.3s ease" }} aria-label="Follow us on Facebook" onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")} onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}>
                <FaFacebook size={19} />
              </a>
              <a href="https://www.youtube.com/channel/UCMyV4yKd27_Vx3Sq2FSDN5A" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.3s ease" }} aria-label="Follow us on YouTube" onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")} onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}>
                <IoLogoYoutube size={21} />
              </a>
              <a href="https://www.instagram.com/f2fintech_official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.3s ease" }} aria-label="Follow us on Instagram" onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")} onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}>
                <AiFillInstagram size={21} />
              </a>
              <a href="https://www.linkedin.com/company/f2fintech" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.3s ease" }} aria-label="Follow us on LinkedIn" onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")} onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}>
                <LinkedInIcon style={{ fontSize: "22px" }} />
              </a>
              <a href="https://wa.me/918810600135" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", display: "flex", alignItems: "center", transition: "color 0.3s ease" }} aria-label="Contact us on WhatsApp" onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD700")} onMouseLeave={(e) => (e.currentTarget.style.color = "inherit")}>
                <IoLogoWhatsapp size={21} />
              </a>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom copyright bar */}
        <Box
          sx={{
            borderTop: "1px solid #fff",
            pt: { xs: 1, md: 3 },
            mt: { xs: 2, md: 4 },
            pb: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: { xs: ".65rem", sm: ".75rem", md: ".8rem" },
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              mb: 1.5,
            }}
          >
            Serving Noida, Delhi, Gurgaon, Ghaziabad, Faridabad, Greater Noida, and all major cities across India.
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontSize: { xs: ".7rem", sm: ".8rem", md: ".9rem" },
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
            }}
          >
            © 2026 All Rights Reserved by F2 Fintech
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Footer
