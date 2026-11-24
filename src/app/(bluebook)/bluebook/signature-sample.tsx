import { Avatar, Byline, type Person } from "./byline";

/**
 * Two ruled lines showing how a person's entries are signed. `plain` leaves
 * the pen colour off, for someone who doesn't have one yet.
 */
export function SignatureSample({
  person,
  plain = false,
}: {
  person: Person;
  plain?: boolean;
}) {
  return (
    <div className="bb-sheet bb-sheet--sample" aria-hidden="true">
      <div className="bb-entry">
        <div className="bb-entry__date">
          <span className="bb-stamp">TODAY</span>
        </div>
        <p className="bb-entry__by">
          {plain ? (
            <span className="bb-by">
              <Avatar person={person} plain />
              <span className="bb-by__name">{person.displayName}</span>
            </span>
          ) : (
            <Byline person={person} />
          )}
        </p>
        <p className="bb-entry__text bb-entry__text--empty">
          How your entries are signed.
        </p>
      </div>
    </div>
  );
}
