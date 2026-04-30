export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col md:flex-row w-full relative overflow-hidden">
      {/* Left hero (desktop) */}
      <section className="hidden md:flex md:w-1/2 relative bg-surface-container-lowest border-r-2 border-surface-container-high">
        <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply" />
        <img
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF115uFsT1Nfl9_J53HnhRyDvd90vx19MKBRLZQvyQDe1I1E6AoikQVI6ex7go9WEiCC1Ih3Z5y91IFoxm3Iczy-KzNaXVDfuLzSznH4ZG8ID4mWj1EwcMRfSu547JdwNF-VCryiSrLMtWBQ7uJJ2Anz7dRD91ShCpPU_pt-1_RN2oJsZP3ydItN-lQxPxhtwWGGsqYkiVQ3PbwaV6ObC5aROKw6C83gpAEQ1KQm99Ml7P6W3aTKejDjgNbFCRQ2bivTRF6pJaKIqX"
        />
        <div className="relative z-20 w-full h-full flex flex-col justify-end p-margin-desktop pb-24 bg-gradient-to-t from-background via-background/50 to-transparent">
          <div className="border-l-4 border-primary-container pl-6">
            <h1 className="font-display-xl text-display-xl text-on-surface uppercase italic mb-stack-sm">
              Forge
              <br />
              <span className="text-primary-container">Iron.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              The Performance Lab demands everything. Enter your credentials to access elite training protocols and analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="w-full md:w-1/2 min-h-screen flex flex-col justify-center items-center p-margin-mobile md:p-margin-desktop relative z-20">
        <div className="md:hidden absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/90 z-10" />
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL_4K_XeT8Yxk2J6CWuxo4mA6Ujbn59JLjopYzLADbPvgIIK2vN3_JPNxvwdyvyMTaVams31LA27qHLtd5kal81qxQ4RbrxPryEMM2sjIUcOGAUIbDc-V9ai2hHuaOFj_8mqUhNKxiux5qRaa3WSEk4CV_vIRSBqY_tUTJTlxEbimsi5OhJSOYIczMN50zt8Sf-LY7Qlxk3Xoc3B6K0toEIcngmGmbKGGVNGwZ9kZtjHuhVYokWtUGSE4TsK960BVmsWJLi0FMSCpC"
          />
        </div>
        <div className="w-full max-w-md relative z-10 space-y-stack-md">{children}</div>
      </section>
    </main>
  );
}
