"use client"

import { FaFacebook } from "react-icons/fa6"
import { IoLogoYoutube, IoLogoWhatsapp } from "react-icons/io"
import { AiFillInstagram } from "react-icons/ai"
import LinkedInIcon from "@mui/icons-material/LinkedIn"

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://f2fintech.com").replace(/\/$/, "")

const companyLinks = [
  { name: "About us", href: `${BASE_URL}/about-us` },
  { name: "Blogs", href: `${BASE_URL}/blogs` },
  { name: "Brochures", href: `${BASE_URL}/brochures` },
  { name: "FAQ", href: `${BASE_URL}/faq` },
  { name: "Careers", href: `${BASE_URL}/careers` },
  { name: "Contact Us", href: `${BASE_URL}/contact-us` },
]

const legalLinks = [
  { name: "Compliance", href: `${BASE_URL}/compliance` },
  { name: "Fair Practices Code", href: `${BASE_URL}/fair-practices-code` },
  { name: "Grievance Policy", href: `${BASE_URL}/grievance-policy` },
  { name: "Privacy Policy", href: `${BASE_URL}/privacy-policy` },
  { name: "Terms and Condition", href: `${BASE_URL}/terms-and-condition` },
]

const productLinks = [
  { name: "Doctor Loan", href: `${BASE_URL}/doctor-loan` },
  { name: "Home Loan", href: `${BASE_URL}/home-loan` },
  { name: "Business Loan", href: `${BASE_URL}/business-loan` },
  { name: "Personal Loan", href: `${BASE_URL}/personal-loan` },
  { name: "Loan Against Property", href: `${BASE_URL}/loan-against-property` },
  { name: "Doctors and Professionals", href: `${BASE_URL}/doctors-and-professionals` },
  { name: "Check Cibil Score", href: `${BASE_URL}/check-cibil-score` },
  { name: "Eligibility Checker", href: "https://finwise-eligibility.netlify.app/" },
  { name: "DSA Partner", href: `${BASE_URL}/dsa` },
  { name: "Realtor Partner", href: `${BASE_URL}/realtor` },
]

export function Footer() {
  const fp = "var(--font-poppins), Poppins, sans-serif"
  const fd = "var(--font-dm-sans), 'DM Sans', sans-serif"

  return (
    <>
      <style>{`
        @keyframes blink-click-here {
          0%, 45%  { opacity: 0; }
          50%, 100% { opacity: 1; }
        }
        .duns-blink { animation: blink-click-here 2s infinite ease-in-out; }
        .f-link {
          color: white;
          text-decoration: none;
          font-size: 0.95rem;
          font-family: var(--font-poppins), Poppins, sans-serif;
          transition: color 0.3s ease;
        }
        .f-link:hover { color: #FFD700; }
        .f-icon { color: white; transition: color 0.3s ease, transform 0.2s ease; }
        .f-icon:hover { color: #FFD700; transform: scale(1.1); }
      `}</style>

      <footer
        id="footer"
        className="w-full bg-[#3244e6] text-white relative z-[1100] px-4 sm:px-8 lg:px-12 py-10 sm:py-14 lg:py-16"
      >
        {/* Inner Box */}
        <div className="max-w-[1450px] mx-auto px-2 sm:px-6 lg:px-8">

          {/* Grid matching exact MUI Footer layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-8 lg:gap-8 xl:gap-12 text-center sm:text-left">

            {/* Column 1: Brand + address */}
            <div className="flex flex-col items-center sm:items-start">
              <a
                href={BASE_URL}
                className="text-white no-underline text-2xl sm:text-3xl lg:text-[2.2rem] font-[700] mb-3 sm:mb-4 block"
                style={{ fontFamily: fd }}
              >
                F2 Fintech
              </a>
              <p
                className="text-white/95 text-sm sm:text-[0.95rem] leading-relaxed m-0"
                style={{ fontFamily: fp }}
              >
                Office 201, Second floor, C-127,<br />
                AGS Park, C Block, Sector 63,<br />
                Noida, Uttar Pradesh 201301<br />
                <span className="whitespace-nowrap inline-block">+91 8810600135, +91 8860600555</span>
              </p>
            </div>

            {/* Columns 2 & 3: Company and Legal & Policy (Side-by-side on mobile, individual columns on sm+) */}
            <div className="col-span-1 sm:contents grid grid-cols-2 gap-6 sm:gap-8 text-left">
              {/* Column 2: Company */}
              <div className="flex flex-col items-start">
                <p
                  className="text-white text-lg sm:text-xl lg:text-[1.35rem] font-[700] mb-3 sm:mb-4"
                  style={{ fontFamily: fd }}
                >
                  Company
                </p>
                {companyLinks.map((link) => (
                  <p key={link.name} className="leading-8 sm:leading-9 text-[0.95rem] sm:text-base m-0">
                    <a href={link.href} className="f-link">{link.name}</a>
                  </p>
                ))}
              </div>

              {/* Column 3: Legal & Policy */}
              <div className="flex flex-col items-start">
                <p
                  className="text-white text-lg sm:text-xl lg:text-[1.35rem] font-[700] mb-3 sm:mb-4"
                  style={{ fontFamily: fd }}
                >
                  Legal &amp; Policy
                </p>
                {legalLinks.map((link) => (
                  <p key={link.name} className="leading-8 sm:leading-9 text-[0.95rem] sm:text-base m-0">
                    <a href={link.href} className="f-link">{link.name}</a>
                  </p>
                ))}
              </div>
            </div>

            {/* Columns 4 & 5: Products and D&B Badge + Let's Connect (Side-by-side on mobile, individual columns on sm+) */}
            <div className="col-span-1 sm:contents grid grid-cols-2 gap-6 sm:gap-8 text-left">
              {/* Column 4: Products */}
              <div className="flex flex-col items-start">
                <p
                  className="text-white text-lg sm:text-xl lg:text-[1.35rem] font-[700] mb-3 sm:mb-4"
                  style={{ fontFamily: fd }}
                >
                  Products
                </p>
                {productLinks.map((link) => (
                  <p key={link.name} className="leading-8 sm:leading-9 text-[0.95rem] sm:text-base m-0">
                    <a href={link.href} className="f-link">{link.name}</a>
                  </p>
                ))}
              </div>

              {/* Column 5: D&B Badge + Let's Connect */}
              <div className="flex flex-col items-start md:col-start-3 lg:col-start-auto">
                {/* Badge */}
                <a
                  href="https://dunsregistered.dnb.com/DunsRegisteredProfileAnywhere.aspx?Key1=3201911&PaArea=Email"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-40 sm:w-44 lg:w-48 mb-4 sm:mb-5 block cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/QRlogo-123.webp"
                    alt="D&B Registered"
                    loading="lazy"
                    className="w-full block bg-white rounded-lg p-2 shadow-md"
                  />
                  <div
                    className="duns-blink absolute bottom-[10%] left-[8%] w-[84%] h-[28%] bg-[#004a77] text-white flex items-center justify-center rounded-md text-xs sm:text-sm font-semibold pointer-events-none"
                    style={{ fontFamily: fp }}
                  >
                    Click Here
                  </div>
                </a>

                <p
                  className="text-white text-lg sm:text-xl lg:text-[1.35rem] font-[700] mb-3 sm:mb-4"
                  style={{ fontFamily: fd }}
                >
                  Let's Connect
                </p>

                {/* Social Icons */}
                <div className="flex flex-wrap items-center justify-start gap-3.5 sm:gap-4 mt-1 text-white">
                  <a href="https://www.facebook.com/f2fintech/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="f-icon flex items-center">
                    <FaFacebook size={22} />
                  </a>
                  <a href="https://www.youtube.com/channel/UCMyV4yKd27_Vx3Sq2FSDN5A" target="_blank" rel="noopener noreferrer" aria-label="Follow us on YouTube" className="f-icon flex items-center">
                    <IoLogoYoutube size={24} />
                  </a>
                  <a href="https://www.instagram.com/f2fintech_official?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="f-icon flex items-center">
                    <AiFillInstagram size={24} />
                  </a>
                  <a href="https://www.linkedin.com/company/f2fintech" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" className="f-icon flex items-center">
                    <LinkedInIcon style={{ fontSize: "24px" }} />
                  </a>
                  <a href="https://wa.me/918810600135" target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp" className="f-icon flex items-center">
                    <IoLogoWhatsapp size={24} />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom copyright bar */}
          <div className="border-t border-white/25 pt-8 sm:pt-10 mt-10 sm:mt-14 pb-4 text-center">
            <p
              className="text-white/80 text-sm sm:text-[0.95rem] mb-2.5 leading-relaxed max-w-4xl mx-auto"
              style={{ fontFamily: fp }}
            >
              Serving Noida, Delhi, Gurgaon, Ghaziabad, Faridabad, Greater Noida, and all major cities across India.
            </p>
            <p
              className="text-white text-sm sm:text-base font-medium m-0"
              style={{ fontFamily: fp }}
            >
              © 2026 All Rights Reserved by F2 Fintech
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}
