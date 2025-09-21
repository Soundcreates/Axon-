export default function Profile() {
  return (
    <main className="page narrow">
      <h2>Profile</h2>
      <div className="grid two">
        <div className="card">
          <div className="form-row">
            <label>Display Name</label>
            <input placeholder="Ada Lovelace" />
          </div>
          <div className="form-row">
            <label>Field(s) of Expertise</label>
            <input placeholder="ML, Cryptography" />
          </div>
          <div className="form-row">
            <label>Affiliation</label>
            <input placeholder="KJSCE" />
          </div>
          <button className="pill primary">Save Profile</button>
        </div>
        <div className="card">
          <div className="form-row">
            <label>Bio</label>
            <textarea rows={8} placeholder="Short reviewer/author bio" />
          </div>
          <div className="muted">Only non-sensitive info is stored off-chain.</div>
        </div>
      </div>
    </main>
  );
}
