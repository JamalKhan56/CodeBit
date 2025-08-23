import './globals.css'
import Navbar from '../components/Navbar/Navbar'

export const metadata = {
  title: 'CodeBits',
  description: 'Your coding blog and resources',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}