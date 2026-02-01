import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { width: 100, height: 32 },
  md: { width: 150, height: 48 },
  lg: { width: 200, height: 64 },
}

export function BankRakyatLogo({ size = 'md', className = '' }: LogoProps) {
  const { width, height } = sizes[size]

  return (
    <Image
      src="/images/bank-rakyat-logo.png"
      alt="Bank Rakyat"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  )
}

export function BankRakyatLogoWhite({ size = 'md', className = '' }: LogoProps) {
  const { width, height } = sizes[size]

  return (
    <Image
      src="/images/bank-rakyat-logo.png"
      alt="Bank Rakyat"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      priority
    />
  )
}
